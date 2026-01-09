/**
 * THE PIT SCENE
 * A monument to all your failures. Every wrong letter ends up here.
 *
 * Visual Design (from concept):
 * - Dark industrial cavern with rust and grime
 * - Left sidebar: Letter frequency breakdown (A: 113, B: 94, etc.)
 * - Top-right: Conveyor belt continuously dumping letters
 * - Bottom: Massive pile of scattered letter blocks
 * - Queue counter showing "LETTERS TO PROCESS: X"
 *
 * Aesthetic: Victorian industrial horror, grimy factory pit
 */

import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { SaveManager } from '../systems/SaveManager';

/** Falling letter for conveyor belt animation */
interface FallingLetter {
  sprite: Phaser.GameObjects.Text;
  velocityY: number;
  velocityX: number;
  rotation: number;
}

export class PitScene extends Phaser.Scene {
  private fallingLetters: FallingLetter[] = [];
  private pileLetters: Phaser.GameObjects.Text[] = [];
  private conveyorLetters: Phaser.GameObjects.Text[] = [];

  // Conveyor belt settings
  private readonly CONVEYOR_SPEED = 80; // pixels per second
  private readonly CONVEYOR_Y = 85;
  private readonly CONVEYOR_START_X = GAME_WIDTH + 50;
  private readonly CONVEYOR_END_X = GAME_WIDTH - 200;
  private readonly DROP_INTERVAL = 800; // ms between letter drops
  private lastDropTime = 0;

  // Layout constants
  private readonly SIDEBAR_WIDTH = 140;
  private readonly PIT_START_X = 160;
  private readonly PIT_FLOOR_Y = GAME_HEIGHT - 80;

  constructor() {
    super({ key: 'PitScene' });
  }

  create(): void {
    this.createBackground();
    this.createCavern();
    this.createConveyorBelt();
    this.createLetterPile();
    this.createSidebar();
    this.createQueueCounter();
    this.createHUD();
    this.setupInput();

    // Reset timing
    this.lastDropTime = 0;
  }

  update(time: number, delta: number): void {
    this.updateConveyor(delta);
    this.updateFallingLetters(delta);
    this.maybeDropLetter(time);
  }

  // ===========================================================================
  // BACKGROUND & CAVERN
  // ===========================================================================

  private createBackground(): void {
    // Deep dark background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0808);

    // Title
    this.add.text(GAME_WIDTH / 2, 30, 'THE PIT', {
      fontFamily: 'VT323, monospace',
      fontSize: '42px',
      color: '#b87333', // Copper/rust color
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);
  }

  private createCavern(): void {
    const graphics = this.add.graphics();

    // Cavern walls - irregular rocky edges
    graphics.fillStyle(0x1a1210, 1); // Dark brown-black

    // Left wall (irregular rock face)
    graphics.beginPath();
    graphics.moveTo(this.PIT_START_X, 0);
    graphics.lineTo(this.PIT_START_X - 20, 100);
    graphics.lineTo(this.PIT_START_X + 10, 200);
    graphics.lineTo(this.PIT_START_X - 15, 350);
    graphics.lineTo(this.PIT_START_X + 5, 500);
    graphics.lineTo(this.PIT_START_X - 10, GAME_HEIGHT);
    graphics.lineTo(0, GAME_HEIGHT);
    graphics.lineTo(0, 0);
    graphics.closePath();
    graphics.fill();

    // Right wall
    graphics.beginPath();
    graphics.moveTo(GAME_WIDTH, 120);
    graphics.lineTo(GAME_WIDTH - 30, 200);
    graphics.lineTo(GAME_WIDTH - 10, 350);
    graphics.lineTo(GAME_WIDTH - 40, 500);
    graphics.lineTo(GAME_WIDTH - 20, GAME_HEIGHT);
    graphics.lineTo(GAME_WIDTH, GAME_HEIGHT);
    graphics.closePath();
    graphics.fill();

    // Add rust streaks and grime
    this.addRustStreaks(graphics);
    this.addGrime(graphics);

    // Pit floor (rocky, uneven)
    graphics.fillStyle(0x0d0a08, 1);
    graphics.beginPath();
    graphics.moveTo(this.PIT_START_X - 20, GAME_HEIGHT);
    graphics.lineTo(this.PIT_START_X + 50, this.PIT_FLOOR_Y + 40);
    graphics.lineTo(400, this.PIT_FLOOR_Y + 20);
    graphics.lineTo(600, this.PIT_FLOOR_Y + 50);
    graphics.lineTo(800, this.PIT_FLOOR_Y + 30);
    graphics.lineTo(1000, this.PIT_FLOOR_Y + 45);
    graphics.lineTo(GAME_WIDTH, this.PIT_FLOOR_Y + 35);
    graphics.lineTo(GAME_WIDTH, GAME_HEIGHT);
    graphics.closePath();
    graphics.fill();

    // Ambient particles (dust, ash)
    this.createAmbientParticles();
  }

  private addRustStreaks(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0x8b4513, 0.3); // Rust color, semi-transparent

    // Random rust streaks on walls
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(170, 250);
      const y = Phaser.Math.Between(100, 500);
      const width = Phaser.Math.Between(3, 8);
      const height = Phaser.Math.Between(40, 120);

      graphics.fillRect(x - this.PIT_START_X + 150, y, width, height);
    }

    // Right side rust
    for (let i = 0; i < 6; i++) {
      const x = GAME_WIDTH - Phaser.Math.Between(20, 60);
      const y = Phaser.Math.Between(150, 550);
      const width = Phaser.Math.Between(3, 8);
      const height = Phaser.Math.Between(30, 100);

      graphics.fillRect(x, y, width, height);
    }
  }

  private addGrime(graphics: Phaser.GameObjects.Graphics): void {
    // Darker patches of grime/soot
    graphics.fillStyle(0x050403, 0.5);

    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(200, GAME_WIDTH - 50);
      const y = Phaser.Math.Between(200, GAME_HEIGHT - 100);
      const radius = Phaser.Math.Between(10, 40);

      graphics.fillCircle(x, y, radius);
    }
  }

  private createAmbientParticles(): void {
    // Floating dust/ash particles
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(this.PIT_START_X + 20, GAME_WIDTH - 40);
      const y = Phaser.Math.Between(100, GAME_HEIGHT - 100);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.3);

      const particle = this.add.circle(x, y, size, 0x888888, alpha);

      // Slow drift animation
      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-30, 30),
        y: y + Phaser.Math.Between(-20, 20),
        alpha: alpha * 0.5,
        duration: Phaser.Math.Between(5000, 10000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  // ===========================================================================
  // CONVEYOR BELT
  // ===========================================================================

  private createConveyorBelt(): void {
    const graphics = this.add.graphics();

    // Conveyor frame (industrial metal)
    graphics.fillStyle(0x3a3a3a, 1);
    graphics.fillRect(GAME_WIDTH - 280, 55, 290, 60);

    // Conveyor belt surface
    graphics.fillStyle(0x2a2018, 1);
    graphics.fillRect(GAME_WIDTH - 270, 70, 270, 30);

    // Belt texture (ridges)
    graphics.lineStyle(1, 0x1a1008, 0.5);
    for (let x = GAME_WIDTH - 260; x < GAME_WIDTH; x += 15) {
      graphics.moveTo(x, 70);
      graphics.lineTo(x, 100);
    }
    graphics.stroke();

    // Support structure
    graphics.fillStyle(0x4a4a4a, 1);
    graphics.fillRect(GAME_WIDTH - 285, 50, 15, 70);
    graphics.fillRect(GAME_WIDTH - 200, 100, 8, 150); // Support beam

    // Roller at the end
    graphics.fillStyle(0x5a5a5a, 1);
    graphics.fillCircle(GAME_WIDTH - 190, 85, 15);

    // Gear/cog decoration
    this.createGear(GAME_WIDTH - 190, 85, 12);

    // Label
    this.add.text(GAME_WIDTH - 250, 120, 'INTAKE', {
      fontFamily: 'VT323, monospace',
      fontSize: '12px',
      color: '#666666',
    });
  }

  private createGear(x: number, y: number, radius: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x6a6a6a, 1);

    // Draw gear teeth
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const toothX = x + Math.cos(angle) * radius;
      const toothY = y + Math.sin(angle) * radius;
      graphics.fillRect(toothX - 2, toothY - 2, 4, 4);
    }

    // Center hub
    graphics.fillStyle(0x4a4a4a, 1);
    graphics.fillCircle(x, y, 6);
  }

  // ===========================================================================
  // LETTER PILE
  // ===========================================================================

  private createLetterPile(): void {
    const totalLetters = SaveManager.getTotalFailedLetters();
    const displayCount = Math.min(totalLetters, 200); // Cap for performance

    // Create a pile of small letter blocks
    for (let i = 0; i < displayCount; i++) {
      const letter = this.getRandomLetter();
      const x = Phaser.Math.Between(this.PIT_START_X + 80, GAME_WIDTH - 80);

      // Pile shape - more letters in the center, higher pile
      const centerDistance = Math.abs(x - (GAME_WIDTH / 2 + 80));
      const pileHeight = Math.max(20, 150 - centerDistance * 0.2);
      const y = this.PIT_FLOOR_Y - Phaser.Math.Between(0, pileHeight);

      const letterText = this.add.text(x, y, letter, {
        fontFamily: 'VT323, monospace',
        fontSize: `${Phaser.Math.Between(10, 18)}px`,
        color: this.getLetterColor(),
      })
        .setOrigin(0.5)
        .setRotation(Phaser.Math.FloatBetween(-0.5, 0.5))
        .setAlpha(Phaser.Math.FloatBetween(0.4, 0.9));

      this.pileLetters.push(letterText);
    }

    // If lots of letters, add overflow indicator
    if (totalLetters > displayCount) {
      this.add.text(GAME_WIDTH / 2 + 80, this.PIT_FLOOR_Y - 180, `+${totalLetters - displayCount} more buried beneath...`, {
        fontFamily: 'VT323, monospace',
        fontSize: '14px',
        color: '#666666',
      }).setOrigin(0.5);
    }
  }

  private getRandomLetter(): string {
    const failedLetters = SaveManager.getFailedLettersSorted();
    if (failedLetters.length === 0) {
      // No failures yet, show placeholder letters
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return letters[Phaser.Math.Between(0, 25)];
    }

    // Weighted random based on frequency
    const totalWeight = failedLetters.reduce((sum, [, count]) => sum + count, 0);
    let random = Phaser.Math.Between(0, totalWeight - 1);

    for (const [letter, count] of failedLetters) {
      random -= count;
      if (random < 0) return letter;
    }

    return failedLetters[0][0];
  }

  private getLetterColor(): string {
    // Muted industrial colors
    const colors = ['#8b7355', '#a0826d', '#6b5344', '#7a6a5a', '#9a8070', '#5a4a3a'];
    return colors[Phaser.Math.Between(0, colors.length - 1)];
  }

  // ===========================================================================
  // SIDEBAR (Letter Frequencies)
  // ===========================================================================

  private createSidebar(): void {
    const graphics = this.add.graphics();

    // Sidebar background (panel)
    graphics.fillStyle(0x1a1612, 0.95);
    graphics.fillRect(10, 60, this.SIDEBAR_WIDTH, GAME_HEIGHT - 100);

    // Border (rust color)
    graphics.lineStyle(2, 0x8b4513, 0.8);
    graphics.strokeRect(10, 60, this.SIDEBAR_WIDTH, GAME_HEIGHT - 100);

    // Panel rivets
    this.addRivets(graphics, 10, 60, this.SIDEBAR_WIDTH, GAME_HEIGHT - 100);

    // Title
    this.add.text(10 + this.SIDEBAR_WIDTH / 2, 75, 'LETTER LOG', {
      fontFamily: 'VT323, monospace',
      fontSize: '16px',
      color: '#b87333',
    }).setOrigin(0.5);

    // Letter frequency list
    this.createFrequencyList();
  }

  private addRivets(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number): void {
    graphics.fillStyle(0x5a4a3a, 1);

    // Corner rivets
    const rivetSize = 4;
    const offset = 8;

    graphics.fillCircle(x + offset, y + offset, rivetSize);
    graphics.fillCircle(x + width - offset, y + offset, rivetSize);
    graphics.fillCircle(x + offset, y + height - offset, rivetSize);
    graphics.fillCircle(x + width - offset, y + height - offset, rivetSize);
  }

  private createFrequencyList(): void {
    const failedLetters = SaveManager.getFailedLetters();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const startY = 100;
    const lineHeight = 22;
    const x = 25;

    // Show all letters A-Z with their counts
    for (let i = 0; i < 26; i++) {
      const letter = alphabet[i];
      const count = failedLetters[letter] || 0;
      const y = startY + i * lineHeight;

      // Only show if there's room
      if (y > GAME_HEIGHT - 80) break;

      // Letter label
      this.add.text(x, y, `${letter}:`, {
        fontFamily: 'VT323, monospace',
        fontSize: '16px',
        color: count > 0 ? '#c9a86c' : '#4a4a4a',
      });

      // Count
      this.add.text(x + 30, y, count > 0 ? count.toString() : '-', {
        fontFamily: 'VT323, monospace',
        fontSize: '16px',
        color: count > 0 ? '#e0d0a0' : '#3a3a3a',
      });

      // Visual bar for non-zero counts
      if (count > 0) {
        const maxCount = Math.max(...Object.values(failedLetters), 1);
        const barWidth = Math.min((count / maxCount) * 60, 60);

        this.add.rectangle(x + 70 + barWidth / 2, y + 8, barWidth, 10, 0x8b4513, 0.6)
          .setOrigin(0.5);
      }
    }
  }

  // ===========================================================================
  // QUEUE COUNTER
  // ===========================================================================

  private createQueueCounter(): void {
    const totalLetters = SaveManager.getTotalFailedLetters();

    // Counter panel
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2a2218, 0.9);
    graphics.fillRect(GAME_WIDTH - 280, 160, 200, 50);
    graphics.lineStyle(2, 0x6a5a4a, 1);
    graphics.strokeRect(GAME_WIDTH - 280, 160, 200, 50);

    // Label
    this.add.text(GAME_WIDTH - 270, 168, 'LETTERS TO PROCESS:', {
      fontFamily: 'VT323, monospace',
      fontSize: '14px',
      color: '#888888',
    });

    // Count (large, prominent)
    this.add.text(GAME_WIDTH - 270, 185, totalLetters.toLocaleString(), {
      fontFamily: 'VT323, monospace',
      fontSize: '28px',
      color: '#e0c080',
    });
  }

  // ===========================================================================
  // HUD & INPUT
  // ===========================================================================

  private createHUD(): void {
    // Back button
    const backBtn = this.add.text(20, 25, '< BACK', {
      fontFamily: 'VT323, monospace',
      fontSize: '18px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor(COLORS.TERMINAL_GREEN_CSS));
    backBtn.on('pointerdown', () => this.returnToBreakRoom());

    // Stats summary at bottom
    const stats = SaveManager.getStats();
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 25,
      `TOTAL ERRORS: ${stats.totalErrors}  |  BALES CREATED: ${stats.balesCreated}  |  LIFETIME SCRAP: ${SaveManager.getLifetimeScrap()}`, {
      fontFamily: 'VT323, monospace',
      fontSize: '14px',
      color: '#666666',
    }).setOrigin(0.5);

    // Instructions
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 8, '[ESC] or [BACKSPACE] to return', {
      fontFamily: 'VT323, monospace',
      fontSize: '12px',
      color: '#444444',
    }).setOrigin(0.5);
  }

  private setupInput(): void {
    // ESC to go back
    this.input.keyboard?.on('keydown-ESC', () => this.returnToBreakRoom());
    this.input.keyboard?.on('keydown-BACKSPACE', () => this.returnToBreakRoom());

    // Click anywhere (except button) to admire your failures
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Add a little dust puff effect where clicked
      if (pointer.y > 100 && pointer.x > this.SIDEBAR_WIDTH + 20) {
        this.createDustPuff(pointer.x, pointer.y);
      }
    });
  }

  private createDustPuff(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const particle = this.add.circle(
        x + Phaser.Math.Between(-10, 10),
        y + Phaser.Math.Between(-10, 10),
        Phaser.Math.Between(2, 5),
        0x888888,
        0.5
      );

      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-30, 30),
        y: particle.y - Phaser.Math.Between(20, 50),
        alpha: 0,
        scale: 0.5,
        duration: 800,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private returnToBreakRoom(): void {
    this.scene.start('BreakRoomScene');
  }

  // ===========================================================================
  // CONVEYOR ANIMATION
  // ===========================================================================

  private updateConveyor(delta: number): void {
    const deltaSeconds = delta / 1000;

    // Move letters on conveyor
    for (let i = this.conveyorLetters.length - 1; i >= 0; i--) {
      const letter = this.conveyorLetters[i];
      letter.x -= this.CONVEYOR_SPEED * deltaSeconds;

      // When letter reaches end of conveyor, start falling
      if (letter.x <= this.CONVEYOR_END_X) {
        this.conveyorLetters.splice(i, 1);
        this.startLetterFall(letter);
      }
    }
  }

  private maybeDropLetter(time: number): void {
    // Only drop if enough time has passed and there are failures
    if (time - this.lastDropTime < this.DROP_INTERVAL) return;

    const totalLetters = SaveManager.getTotalFailedLetters();
    if (totalLetters === 0) return;

    this.lastDropTime = time;

    // Spawn a new letter on the conveyor
    const letter = this.getRandomLetter();
    const letterText = this.add.text(this.CONVEYOR_START_X, this.CONVEYOR_Y, letter, {
      fontFamily: 'VT323, monospace',
      fontSize: '20px',
      color: '#c9a86c',
    }).setOrigin(0.5);

    this.conveyorLetters.push(letterText);
  }

  private startLetterFall(letterSprite: Phaser.GameObjects.Text): void {
    const falling: FallingLetter = {
      sprite: letterSprite,
      velocityY: 50,
      velocityX: Phaser.Math.Between(-30, 30),
      rotation: Phaser.Math.FloatBetween(-0.1, 0.1),
    };

    this.fallingLetters.push(falling);
  }

  private updateFallingLetters(delta: number): void {
    const deltaSeconds = delta / 1000;
    const gravity = 400; // pixels per second squared

    for (let i = this.fallingLetters.length - 1; i >= 0; i--) {
      const letter = this.fallingLetters[i];

      // Apply gravity
      letter.velocityY += gravity * deltaSeconds;

      // Update position
      letter.sprite.x += letter.velocityX * deltaSeconds;
      letter.sprite.y += letter.velocityY * deltaSeconds;
      letter.sprite.rotation += letter.rotation;

      // When letter hits the pile, settle it
      if (letter.sprite.y >= this.PIT_FLOOR_Y - 20) {
        this.fallingLetters.splice(i, 1);
        this.settleLetter(letter.sprite);
      }
    }
  }

  private settleLetter(sprite: Phaser.GameObjects.Text): void {
    // Fade to pile appearance
    sprite.setFontSize(14);
    sprite.setColor(this.getLetterColor());
    sprite.setAlpha(0.7);

    // Add to pile
    this.pileLetters.push(sprite);

    // Cap pile size for performance
    if (this.pileLetters.length > 250) {
      const oldest = this.pileLetters.shift();
      oldest?.destroy();
    }
  }
}
