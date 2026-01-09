/**
 * GAME SCENE
 * Core gameplay: typing words while the crusher descends and pushes letter blocks.
 *
 * Physics-based coin-pusher mechanics:
 * - Letters are Matter.js bodies that get pushed by the crusher
 * - Penalty letters spawn on errors (3x mass)
 * - Letters remain readable (rotation constrained)
 * - On loss, letters compress into "The Bale"
 */

import Phaser from 'phaser';
import {
  COLORS,
  GAME_HEIGHT,
  LAYOUT,
  CRUSHER,
  COMBO,
  LETTER_POOL,
  TIMING,
  PARTICLES,
  PHYSICS,
  BLANK_DISPLAY,
} from '../constants';
import {
  CrusherState,
  Difficulty,
  GameEvents,
  GameStats,
  Phrase,
} from '../types';
import { getRandomPhrase } from '@utils/wordUtils';
import { SettingsManager } from '@systems/SettingsManager';
import { SaveManager } from '@systems/SaveManager';

// Physics body labels for collision detection
const BODY_LABELS = {
  LETTER: 'letter',
  PENALTY: 'penalty',
  CRUSHER: 'crusher',
  WALL: 'wall',
  FLOOR: 'floor',
} as const;

interface LetterBody {
  id: string;
  char: string;
  body: MatterJS.BodyType;
  container: Phaser.GameObjects.Container;
  isPenalty: boolean;
  isUsed: boolean;
}

export class GameScene extends Phaser.Scene {
  // Game state
  private currentPhrase!: Phrase;
  private typedIndex: number = 0;
  private errors: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  private startTime: number = 0;

  // Flags
  private isPanicking: boolean = false;
  private isOverdrive: boolean = false;
  private isGameOver: boolean = false;
  private isCompressing: boolean = false;
  private hasStartedTyping: boolean = false;

  // Crusher state machine (graduated awakening)
  private crusherState: CrusherState = CrusherState.DORMANT;
  private mistakeCount: number = 0;        // Total mistakes (for awakening threshold)
  private penaltyCount: number = 0;        // Penalty letters on crusher (for acceleration)
  private slideRemaining: number = 0;      // Remaining slide distance (px) for STIRRING/LOOSENING
  private isSliding: boolean = false;      // Currently in a slide animation
  private isPaused: boolean = false;
  private pauseUntil: number = 0;

  // Runway calculation (cached for percentage conversions)
  private runway: number = 0;              // Distance from start to fail zone

  // Physics bodies
  private letterBodies: LetterBody[] = [];
  private crusherBody!: MatterJS.BodyType;
  private crusherSprite!: Phaser.GameObjects.Rectangle;
  private crusherY: number = 0;

  // Target display
  private targetDisplay!: Phaser.GameObjects.Container;

  // Particles
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private errorParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Camera for screen shake
  private mainCamera!: Phaser.Cameras.Scene2D.Camera;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.resetState();
    this.setupPhrase();
    this.createBoundaries();
    this.createStagingArea();
    this.createCrusher();
    this.createLetterBodies();
    this.createTargetDisplay();
    this.createParticleSystems();
    this.setupInput();
    this.setupLetterClickHandlers();
    this.setupCollisionHandlers();

    this.mainCamera = this.cameras.main;

    // Launch UI scene in parallel
    this.scene.launch('UIScene');
  }

  private resetState(): void {
    this.typedIndex = 0;
    this.errors = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.isPanicking = false;
    this.isOverdrive = false;
    this.isGameOver = false;
    this.isCompressing = false;
    this.hasStartedTyping = false;
    this.startTime = 0;
    this.crusherY = CRUSHER.INITIAL_Y;
    this.letterBodies = [];

    // Crusher state machine (graduated awakening)
    this.crusherState = CrusherState.DORMANT;
    this.mistakeCount = 0;
    this.penaltyCount = 0;
    this.slideRemaining = 0;
    this.isSliding = false;
    this.isPaused = false;
    this.pauseUntil = 0;

    // Calculate runway (distance from start to fail zone) for percentage conversions
    const killZoneY = LAYOUT.FAIL_ZONE_Y - CRUSHER.HEIGHT;
    this.runway = killZoneY - CRUSHER.INITIAL_Y;
  }

  /** Convert a percentage of runway to pixels */
  private percentToPixels(percent: number): number {
    return (percent / 100) * this.runway;
  }

  /** Get current difficulty setting */
  private getDifficulty(): Difficulty {
    return this.registry.get('selectedDifficulty') as Difficulty || Difficulty.EASY;
  }

  private setupPhrase(): void {
    const difficulty = this.getDifficulty();
    this.currentPhrase = getRandomPhrase(difficulty);
  }

  private createBoundaries(): void {
    const wallOptions: Phaser.Types.Physics.Matter.MatterBodyConfig = {
      isStatic: true,
      friction: PHYSICS.FRICTION,
      restitution: PHYSICS.RESTITUTION,
      label: BODY_LABELS.WALL,
    };

    // Left wall (at edge of game area, after sidebar)
    this.matter.add.rectangle(
      LAYOUT.GAME_AREA_X - PHYSICS.WALL_THICKNESS / 2,
      GAME_HEIGHT / 2,
      PHYSICS.WALL_THICKNESS,
      GAME_HEIGHT,
      wallOptions
    );

    // Right wall (at right edge of game area)
    this.matter.add.rectangle(
      LAYOUT.GAME_AREA_X + LAYOUT.GAME_AREA_WIDTH + PHYSICS.WALL_THICKNESS / 2,
      GAME_HEIGHT / 2,
      PHYSICS.WALL_THICKNESS,
      GAME_HEIGHT,
      wallOptions
    );

    // Floor (at fail zone)
    this.matter.add.rectangle(
      LAYOUT.GAME_AREA_CENTER_X,
      LAYOUT.FAIL_ZONE_Y + PHYSICS.WALL_THICKNESS / 2,
      LAYOUT.GAME_AREA_WIDTH + PHYSICS.WALL_THICKNESS * 2,
      PHYSICS.WALL_THICKNESS,
      { ...wallOptions, label: BODY_LABELS.FLOOR }
    );

    // Visual fail zone line
    this.add.rectangle(
      LAYOUT.GAME_AREA_CENTER_X,
      LAYOUT.FAIL_ZONE_Y,
      LAYOUT.GAME_AREA_WIDTH,
      4,
      COLORS.ERROR_RED,
      0.5
    );

    // Visual sidebar separator
    this.add.rectangle(
      LAYOUT.GAME_AREA_X,
      GAME_HEIGHT / 2,
      2,
      GAME_HEIGHT,
      COLORS.UI_DIM,
      0.3
    );
  }

  private createCrusher(): void {
    // Visual representation - centered in game area
    this.crusherSprite = this.add.rectangle(
      LAYOUT.GAME_AREA_CENTER_X,
      this.crusherY,
      CRUSHER.WIDTH,
      CRUSHER.HEIGHT,
      COLORS.TERMINAL_GREEN
    ).setStrokeStyle(4, COLORS.GREEN_LIGHT);

    // Add detail line
    this.add.rectangle(
      LAYOUT.GAME_AREA_CENTER_X,
      this.crusherY,
      CRUSHER.WIDTH - 20,
      CRUSHER.HEIGHT - 10,
      0x000000,
      0.3
    ).setData('crusherDetail', true);

    // Physics body - kinematic (we control it, but it affects others)
    this.crusherBody = this.matter.add.rectangle(
      LAYOUT.GAME_AREA_CENTER_X,
      this.crusherY + CRUSHER.HEIGHT / 2,
      CRUSHER.WIDTH,
      CRUSHER.HEIGHT,
      {
        isStatic: true, // We move it manually
        friction: PHYSICS.FRICTION,
        restitution: 0.1,
        label: BODY_LABELS.CRUSHER,
        chamfer: { radius: 5 },
      }
    );
  }

  private createLetterBodies(): void {
    // Get letters from phrase (excluding spaces/punctuation)
    const chars = this.currentPhrase.text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const blockSize = PHYSICS.LETTER_BLOCK_SIZE;
    const minSpacing = LETTER_POOL.MIN_SPACING;

    // Track placed positions for collision avoidance
    const placedPositions: { x: number; y: number }[] = [];

    // Find a valid position that doesn't overlap existing letters
    const findValidPosition = (): { x: number; y: number } => {
      const maxAttempts = 50;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = Phaser.Math.Between(
          LETTER_POOL.SPAWN_X_MIN + blockSize / 2,
          LETTER_POOL.SPAWN_X_MAX - blockSize / 2
        );
        const y = Phaser.Math.Between(
          LETTER_POOL.SPAWN_Y_MIN + blockSize / 2,
          LETTER_POOL.SPAWN_Y_MAX - blockSize / 2
        );

        // Check distance from all placed letters
        let valid = true;
        for (const pos of placedPositions) {
          const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          if (dist < minSpacing) {
            valid = false;
            break;
          }
        }

        if (valid) {
          return { x, y };
        }
      }

      // Fallback: just pick a random spot (physics will sort it out)
      return {
        x: Phaser.Math.Between(LETTER_POOL.SPAWN_X_MIN, LETTER_POOL.SPAWN_X_MAX),
        y: Phaser.Math.Between(LETTER_POOL.SPAWN_Y_MIN, LETTER_POOL.SPAWN_Y_MAX),
      };
    };

    chars.split('').forEach((char, i) => {
      const pos = findValidPosition();
      placedPositions.push(pos);

      const rotation = Phaser.Math.DegToRad(
        Phaser.Math.Between(-LETTER_POOL.MAX_ROTATION, LETTER_POOL.MAX_ROTATION)
      );

      this.createLetterBody(char, pos.x, pos.y, rotation, false, `letter-${i}`);
    });
  }

  private createLetterBody(
    char: string,
    x: number,
    y: number,
    rotation: number,
    isPenalty: boolean,
    id: string
  ): LetterBody {
    const blockSize = PHYSICS.LETTER_BLOCK_SIZE;
    const mass = isPenalty ? PHYSICS.PENALTY_LETTER_MASS : PHYSICS.LETTER_MASS;

    // Create container for sprite + text
    const container = this.add.container(x, y);

    // Background block
    const block = this.add.image(0, 0, isPenalty ? 'penalty_block' : 'letter_block');
    container.add(block);

    // Letter text
    const colorVariants = [
      COLORS.TERMINAL_GREEN_CSS,
      '#77ffaa',
      '#00ee66',
      '#aaffcc',
    ];
    const text = this.add.text(0, 0, char, {
      fontFamily: 'VT323, monospace',
      fontSize: `${LETTER_POOL.FONT_SIZE}px`,
      color: isPenalty ? COLORS.ERROR_RED_CSS : colorVariants[Math.floor(Math.random() * 4)],
    }).setOrigin(0.5);
    container.add(text);

    container.setRotation(rotation);

    // Create physics body
    const body = this.matter.add.rectangle(x, y, blockSize - 4, blockSize - 4, {
      mass: mass,
      friction: PHYSICS.FRICTION,
      frictionStatic: PHYSICS.FRICTION_STATIC,
      frictionAir: PHYSICS.FRICTION_AIR,
      restitution: PHYSICS.RESTITUTION,
      angle: rotation,
      label: isPenalty ? BODY_LABELS.PENALTY : BODY_LABELS.LETTER,
      chamfer: { radius: 6 },
    });

    // Note: Angular damping applied via syncLetterVisuals() rotation constraints

    const letterBody: LetterBody = {
      id,
      char,
      body,
      container,
      isPenalty,
      isUsed: false,
    };

    this.letterBodies.push(letterBody);
    return letterBody;
  }

  private createTargetDisplay(): void {
    // Position in center of game area at bottom
    this.targetDisplay = this.add.container(LAYOUT.GAME_AREA_CENTER_X, LAYOUT.BLANK_DISPLAY_Y);

    // Add theme label above the blanks
    // Build theme + tag label (e.g., "FOOD • fruit")
    const theme = this.currentPhrase.category?.toUpperCase() || 'UNKNOWN';
    const tag = this.currentPhrase.tag ? ` • ${this.currentPhrase.tag}` : '';
    const themeLabel = this.add.text(0, -55, `${theme}${tag}`, {
      fontFamily: 'VT323, monospace',
      fontSize: `${BLANK_DISPLAY.THEME_FONT_SIZE}px`,
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.7);
    this.targetDisplay.add(themeLabel);

    this.updateTargetDisplay();
  }

  private createStagingArea(): void {
    // Visual staging area at top where wrong letters appear before falling
    this.add.rectangle(
      LAYOUT.GAME_AREA_CENTER_X,
      LAYOUT.STAGING_AREA_Y,
      LAYOUT.GAME_AREA_WIDTH - 40,
      LAYOUT.STAGING_AREA_HEIGHT - 10,
      0x111111,
      0.5
    ).setStrokeStyle(1, COLORS.UI_DIM);

    // Label
    this.add.text(
      LAYOUT.GAME_AREA_CENTER_X,
      LAYOUT.STAGING_AREA_Y,
      'ERRORS',
      {
        fontFamily: 'VT323, monospace',
        fontSize: '14px',
        color: '#666666',
      }
    ).setOrigin(0.5).setAlpha(0.5);
  }

  private updateTargetDisplay(): void {
    this.targetDisplay.removeAll(true);

    // Re-add theme label (gets destroyed by removeAll)
    const theme = this.currentPhrase.category?.toUpperCase() || 'UNKNOWN';
    const tag = this.currentPhrase.tag ? ` • ${this.currentPhrase.tag}` : '';
    const themeLabel = this.add.text(0, -55, `${theme}${tag}`, {
      fontFamily: 'VT323, monospace',
      fontSize: `${BLANK_DISPLAY.THEME_FONT_SIZE}px`,
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.7);
    this.targetDisplay.add(themeLabel);

    const words = this.currentPhrase.text.split(' ');
    let globalCharIndex = 0;

    // Use constants, with scaling if too wide
    let charWidth: number = BLANK_DISPLAY.CHAR_WIDTH;
    let charHeight: number = BLANK_DISPLAY.CHAR_HEIGHT;
    let fontSize: number = BLANK_DISPLAY.FONT_SIZE;
    const wordGap = BLANK_DISPLAY.WORD_GAP;

    // Calculate total width at full size
    const totalChars = this.currentPhrase.text.replace(/ /g, '').length;
    const numSpaces = words.length - 1;
    const fullWidth = totalChars * charWidth + numSpaces * wordGap;

    // Scale down if too wide (single step, not continuous)
    if (fullWidth > BLANK_DISPLAY.MAX_WIDTH) {
      const scale = BLANK_DISPLAY.MAX_WIDTH / fullWidth;
      charWidth = Math.floor(charWidth * scale);
      charHeight = Math.floor(charHeight * scale);
      fontSize = Math.floor(fontSize * scale);
    }

    // Calculate total width for centering (with potentially scaled values)
    const totalWidth = words.reduce((sum, word, i) => {
      return sum + word.length * charWidth + (i < words.length - 1 ? wordGap : 0);
    }, 0);

    let currentX = -totalWidth / 2;

    words.forEach((word, wordIndex) => {
      word.split('').forEach((char) => {
        const absoluteIndex = globalCharIndex;
        const isTyped = absoluteIndex < this.typedIndex;
        const isCurrent = absoluteIndex === this.typedIndex;
        const isAlphanumeric = /^[A-Z0-9]$/i.test(char);

        // Character box (add first so text appears on top)
        const box = this.add.rectangle(
          currentX + charWidth / 2,
          0,
          charWidth - 4,
          charHeight,
          0x000000,
          isAlphanumeric ? 1 : 0.3
        ).setStrokeStyle(
          isCurrent ? 3 : 2,
          isTyped ? COLORS.TERMINAL_GREEN :
            isCurrent ? COLORS.OVERDRIVE_WHITE :
              COLORS.UI_DIM
        );
        this.targetDisplay.add(box);

        // Character text (only show if typed or non-alphanumeric)
        if (isTyped || !isAlphanumeric) {
          const charText = this.add.text(
            currentX + charWidth / 2,
            0,
            char.toUpperCase(),
            {
              fontFamily: 'VT323, monospace',
              fontSize: `${fontSize}px`,
              color: isTyped ? COLORS.TERMINAL_GREEN_CSS : '#666666',
            }
          ).setOrigin(0.5);

          this.targetDisplay.add(charText);
        }

        // Cursor animation for current character
        if (isCurrent && isAlphanumeric) {
          this.tweens.add({
            targets: box,
            scaleY: 1.1,
            duration: 300,
            yoyo: true,
            repeat: -1,
          });
        }
        currentX += charWidth;
        globalCharIndex++;
      });

      // Add space between words
      if (wordIndex < words.length - 1) {
        currentX += wordGap;
        globalCharIndex++; // Account for space character
      }
    });
  }

  private createParticleSystems(): void {
    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      lifespan: PARTICLES.LIFETIME_MS,
      gravityY: 200,
      emitting: false,
    });

    this.errorParticles = this.add.particles(0, 0, 'particle_error', {
      speed: { min: 150, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 2, end: 0 },
      lifespan: PARTICLES.LIFETIME_MS,
      gravityY: 300,
      emitting: false,
    });
  }

  private setupInput(): void {
    // Keyboard input (standard mode)
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.isGameOver) return;
      if (event.repeat) return;

      // ESC to pause (only non-letter hotkey allowed during gameplay)
      if (event.key === 'Escape') {
        this.scene.launch('PauseScene');
        this.scene.pause();
        return;
      }

      // Only process single character inputs for typing
      const key = event.key.toUpperCase();
      if (key.length !== 1) return;
      this.processInput(key);
    });

    // Mouse-only mode: clicking letters acts as typing them
    // Set up in setupLetterClickHandlers() after letters are created
  }

  /**
   * Set up click handlers for all letter bodies.
   * In mouse-only mode, clicking a letter processes it as input.
   */
  private setupLetterClickHandlers(): void {
    this.letterBodies.forEach((letterBody) => {
      if (letterBody.isPenalty) return; // Can't click penalty letters

      const block = letterBody.container.list[0] as Phaser.GameObjects.Image;
      if (!block) return;

      // Make the block interactive
      block.setInteractive({ useHandCursor: true });

      // Handle click
      block.on('pointerdown', () => {
        if (this.isGameOver) return;

        // Only process clicks in mouse-only mode
        if (!SettingsManager.isMouseOnlyMode()) return;

        // Process this letter as input
        this.processInput(letterBody.char);
      });

      // Hover feedback in mouse-only mode
      block.on('pointerover', () => {
        if (!SettingsManager.isMouseOnlyMode()) return;
        if (letterBody.isUsed) return;

        // Highlight on hover
        letterBody.container.setScale(1.15);
        const textChild = letterBody.container.list[1] as Phaser.GameObjects.Text;
        textChild.setShadow(0, 0, COLORS.TERMINAL_GREEN_CSS, 10, true, true);
      });

      block.on('pointerout', () => {
        if (!SettingsManager.isMouseOnlyMode()) return;
        if (letterBody.isUsed) return;

        // Reset hover state
        letterBody.container.setScale(1);
        const textChild = letterBody.container.list[1] as Phaser.GameObjects.Text;
        textChild.setShadow(0, 0, 'transparent', 0);
      });
    });
  }

  private setupCollisionHandlers(): void {
    // Constrain letter rotation on collision to maintain readability
    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      event.pairs.forEach((pair) => {
        const labels = [pair.bodyA.label, pair.bodyB.label];

        // When letters collide with crusher or each other, dampen rotation
        if (labels.includes(BODY_LABELS.LETTER) || labels.includes(BODY_LABELS.PENALTY)) {
          [pair.bodyA, pair.bodyB].forEach((body) => {
            if (body.label === BODY_LABELS.LETTER || body.label === BODY_LABELS.PENALTY) {
              // Clamp angular velocity
              const maxAngularVelocity = 0.05;
              if (Math.abs(body.angularVelocity) > maxAngularVelocity) {
                this.matter.body.setAngularVelocity(body, Math.sign(body.angularVelocity) * maxAngularVelocity);
              }
            }
          });
        }
      });
    });
  }

  private processInput(key: string): void {
    const currentChar = this.currentPhrase.text[this.typedIndex]?.toUpperCase();

    console.log(`[GameScene] processInput: key='${key}', expected='${currentChar}', index=${this.typedIndex}`);

    if (!currentChar) return;

    // Start timer on first keypress (not level load)
    if (!this.hasStartedTyping) {
      this.hasStartedTyping = true;
      this.startTime = Date.now();
    }

    // Check if current character should be auto-completed (space, punctuation)
    if (!/^[A-Z0-9]$/.test(currentChar)) {
      this.typedIndex++;
      this.updateTargetDisplay();
      this.processInput(key);
      return;
    }

    if (key === currentChar) {
      this.handleCorrectInput(key);
    } else {
      // Check if this key is valid but in wrong position (exists later in phrase)
      const remainingPhrase = this.currentPhrase.text.slice(this.typedIndex + 1).toUpperCase();
      const isValidButWrongPosition = remainingPhrase.includes(key);

      this.handleWrongInput(key, currentChar, isValidButWrongPosition);
    }
  }

  private handleCorrectInput(char: string): void {
    this.typedIndex++;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    // Lift the crusher (only if not DORMANT - includes STIRRING, LOOSENING, AWAKENED)
    if (this.crusherState !== CrusherState.DORMANT) {
      const difficulty = this.getDifficulty();

      // Base lift + linear combo bonus (tame, not exponential)
      const baseLiftPercent = CRUSHER.LIFT_PERCENT[difficulty];
      const comboBonusPercent = this.combo * CRUSHER.LIFT_COMBO_BONUS_PERCENT;
      const totalLiftPercent = baseLiftPercent + comboBonusPercent;
      const liftAmount = this.percentToPixels(totalLiftPercent);

      this.crusherY = Math.max(
        CRUSHER.INITIAL_Y,
        this.crusherY - liftAmount
      );

      // Cancel any active slide (correct input = relief)
      this.slideRemaining = 0;
      this.isSliding = false;

      // Brief pause on correct input - moment of relief
      this.isPaused = true;
      this.pauseUntil = this.time.now + CRUSHER.PAUSE_DURATION_MS;
    }

    // Check for overdrive
    if (this.combo >= COMBO.OVERDRIVE_THRESHOLD && !this.isOverdrive) {
      this.triggerOverdrive();
    }

    // Remove letter from physics world
    this.removeTypedLetter(char);

    // Spawn particles at the removed letter position
    const removedLetter = this.letterBodies.find(lb => lb.char === char && lb.isUsed);
    if (removedLetter) {
      this.particles.emitParticleAt(
        removedLetter.container.x,
        removedLetter.container.y,
        PARTICLES.CORRECT_COUNT
      );
    }

    // Update display
    this.updateTargetDisplay();

    // Emit event for UI/audio
    this.events.emit(GameEvents.CORRECT_LETTER, { char, index: this.typedIndex, combo: this.combo });

    // Check for phrase completion
    if (this.typedIndex >= this.currentPhrase.text.length) {
      this.handleWin();
    }
  }

  private handleWrongInput(pressed: string, expected: string, isValidButWrongPosition: boolean = false): void {
    console.log(`[GameScene] handleWrongInput: pressed='${pressed}', expected='${expected}'`);

    this.errors++;
    this.mistakeCount++;
    this.penaltyCount++;
    this.combo = 0;
    this.isOverdrive = false;

    // Track failed letter for The Pit
    SaveManager.recordFailedLetter(pressed);

    const difficulty = this.getDifficulty();
    const awakeningThreshold = CRUSHER.AWAKENING_THRESHOLD[difficulty];

    // Graduated awakening: progress through states based on mistake count
    this.progressCrusherState(awakeningThreshold);

    // Apply the "shove" (instant drop) - same for all states
    const shoveAmount = this.percentToPixels(CRUSHER.AWAKENING.SHOVE_DROP_PERCENT);
    this.crusherY = Math.min(
      LAYOUT.FAIL_ZONE_Y - CRUSHER.HEIGHT,
      this.crusherY + shoveAmount
    );

    // Set up the slide based on current state
    if (this.crusherState === CrusherState.STIRRING) {
      // 1st mistake: small slide, then stops
      this.slideRemaining = this.percentToPixels(CRUSHER.AWAKENING.STIRRING_SLIDE_PERCENT);
      this.isSliding = true;
    } else if (this.crusherState === CrusherState.LOOSENING) {
      // 2nd mistake: longer slide, then stops
      this.slideRemaining = this.percentToPixels(CRUSHER.AWAKENING.LOOSENING_SLIDE_PERCENT);
      this.isSliding = true;
    }
    // AWAKENED state: continuous descent handled in update()

    // Screen shake (if enabled)
    if (SettingsManager.isScreenShakeEnabled()) {
      this.mainCamera.shake(TIMING.SCREEN_SHAKE_DURATION_MS, 0.01);
    }

    // Spawn penalty letter near the crusher
    this.spawnPenaltyLetter(pressed);

    // Error particles at crusher
    this.errorParticles.emitParticleAt(
      LAYOUT.GAME_AREA_CENTER_X + Phaser.Math.Between(-100, 100),
      this.crusherY + CRUSHER.HEIGHT,
      PARTICLES.ERROR_COUNT
    );

    // Flash effect on crusher
    this.tweens.add({
      targets: this.crusherSprite,
      fillColor: { from: COLORS.ERROR_RED, to: COLORS.TERMINAL_GREEN },
      duration: TIMING.ERROR_FLASH_DURATION_MS,
    });

    // If valid but wrong position, highlight the letter on the board
    if (isValidButWrongPosition) {
      this.highlightValidLetter(pressed);
    }

    // Emit event
    this.events.emit(GameEvents.WRONG_LETTER, { expected, received: pressed, index: this.typedIndex });
  }

  private removeTypedLetter(char: string): void {
    // Find first unused letter matching this character
    const letterBody = this.letterBodies.find(lb => lb.char === char && !lb.isUsed && !lb.isPenalty);
    if (letterBody) {
      letterBody.isUsed = true;

      // Animate letter disappearing
      this.tweens.add({
        targets: letterBody.container,
        alpha: 0,
        scale: 0,
        duration: 150,
        onComplete: () => {
          // Remove from physics world
          this.matter.world.remove(letterBody.body);
          letterBody.container.destroy();
        },
      });
    }
  }

  private highlightValidLetter(char: string): void {
    // Find first unused letter matching this character (that's still on the board)
    const letterBody = this.letterBodies.find(lb => lb.char === char && !lb.isUsed && !lb.isPenalty);
    if (!letterBody || !letterBody.container.active) return;

    const textChild = letterBody.container.list[1] as Phaser.GameObjects.Text;
    const blockChild = letterBody.container.list[0] as Phaser.GameObjects.Image;

    // Bright yellow highlight with strong glow
    textChild.setColor('#ffff00');
    textChild.setShadow(0, 0, '#ffff00', 25, true, true);

    // Tint the block yellow
    if (blockChild.setTint) {
      blockChild.setTint(0xffff00);
    }

    // Initial pop
    this.tweens.add({
      targets: letterBody.container,
      scale: { from: 1.5, to: 1.2 },
      duration: 150,
      ease: 'Back.out',
    });

    // Pulsing glow animation (repeats while highlighted)
    const pulseKey = `highlight-pulse-${letterBody.id}`;
    this.tweens.add({
      targets: letterBody.container,
      scale: { from: 1.2, to: 1.3 },
      duration: 300,
      yoyo: true,
      repeat: 2,
      key: pulseKey,
    });

    // Fade back to normal after 1.5 seconds (longer visibility)
    this.time.delayedCall(1500, () => {
      if (!letterBody.container.active) return;

      // Reset text color
      const colorVariants = ['#00ff41', '#77ffaa', '#00ee66', '#aaffcc'];
      textChild.setColor(colorVariants[Math.floor(Math.random() * 4)]);
      textChild.setShadow(0, 0, 'transparent', 0);

      // Reset scale
      this.tweens.add({
        targets: letterBody.container,
        scale: 1,
        duration: 200,
      });

      // Clear tint
      if (blockChild.clearTint) {
        blockChild.clearTint();
      }
    });
  }

  private spawnPenaltyLetter(char: string): void {
    // Final spawn position (near staging area, will fall from there)
    const targetX = LAYOUT.GAME_AREA_CENTER_X + Phaser.Math.Between(-150, 150);
    const targetY = LAYOUT.STAGING_AREA_Y + LAYOUT.STAGING_AREA_HEIGHT;
    const rotation = Phaser.Math.DegToRad(Phaser.Math.Between(-15, 15));

    // Create a temporary visual letter in the staging area first
    const stagingLetter = this.add.text(
      LAYOUT.GAME_AREA_CENTER_X,
      LAYOUT.STAGING_AREA_Y,
      char,
      {
        fontFamily: 'VT323, monospace',
        fontSize: `${LETTER_POOL.FONT_SIZE + 10}px`,
        color: COLORS.ERROR_RED_CSS,
      }
    ).setOrigin(0.5);

    // Add glow effect
    stagingLetter.setShadow(0, 0, COLORS.ERROR_RED_CSS, 15, true, true);

    // Scale up from center then animate to target position
    stagingLetter.setScale(0);

    this.tweens.add({
      targets: stagingLetter,
      scale: 1.5,
      duration: 100,
      ease: 'Back.out',
      onComplete: () => {
        // Animate falling to spawn position
        this.tweens.add({
          targets: stagingLetter,
          x: targetX,
          y: targetY,
          scale: 1,
          rotation: rotation,
          duration: 250,
          ease: 'Quad.in',
          onComplete: () => {
            // Remove staging visual
            stagingLetter.destroy();

            // Create actual physics body at target position
            this.createLetterBody(
              char,
              targetX,
              targetY,
              rotation,
              true,
              `penalty-${Date.now()}-${Math.random()}`
            );
          },
        });
      },
    });
  }

  private applyPenaltyGravity(): void {
    // Apply gravity to penalty letters so they fall onto crusher
    const gravityForce = PHYSICS.PENALTY_GRAVITY;
    this.letterBodies.forEach((letterBody) => {
      if (letterBody.isPenalty && !letterBody.isUsed && letterBody.container.active) {
        this.matter.body.applyForce(letterBody.body, letterBody.body.position, { x: 0, y: gravityForce });
      }
    });
  }

  private triggerOverdrive(): void {
    this.isOverdrive = true;

    // Visual feedback
    this.mainCamera.flash(500, 0, 255, 65, false);

    // Kinetic pulse - big lift
    const totalTravel = LAYOUT.FAIL_ZONE_Y - CRUSHER.INITIAL_Y;
    const pulseAmount = totalTravel * (CRUSHER.LIFT_KINETIC_PULSE_PERCENT / 100);
    this.crusherY = Math.max(
      CRUSHER.INITIAL_Y,
      this.crusherY - pulseAmount
    );

    // End overdrive after duration
    this.time.delayedCall(COMBO.OVERDRIVE_DURATION_MS, () => {
      this.isOverdrive = false;
    });

    this.events.emit(GameEvents.CRUSHER_OVERDRIVE);
  }

  /**
   * Progress the crusher through awakening states based on mistake count.
   * Graduated awakening: DORMANT → STIRRING → LOOSENING → AWAKENED
   * The threshold determines how many mistakes before reaching AWAKENED.
   */
  private progressCrusherState(threshold: number): void {
    const previousState = this.crusherState;

    // Determine new state based on mistake count and threshold
    if (this.mistakeCount >= threshold) {
      this.crusherState = CrusherState.AWAKENED;
    } else if (threshold === 1) {
      // Expert mode: 1st mistake = AWAKENED immediately
      this.crusherState = CrusherState.AWAKENED;
    } else if (threshold === 2) {
      // Hard mode: 1st = STIRRING, 2nd = AWAKENED
      this.crusherState = this.mistakeCount === 1 ? CrusherState.STIRRING : CrusherState.AWAKENED;
    } else if (threshold === 3) {
      // Medium mode: 1st = STIRRING, 2nd = LOOSENING, 3rd = AWAKENED
      if (this.mistakeCount === 1) this.crusherState = CrusherState.STIRRING;
      else if (this.mistakeCount === 2) this.crusherState = CrusherState.LOOSENING;
      else this.crusherState = CrusherState.AWAKENED;
    } else {
      // Easy mode (threshold 4): 1st = STIRRING, 2nd = LOOSENING, 3rd = still LOOSENING, 4th = AWAKENED
      if (this.mistakeCount === 1) this.crusherState = CrusherState.STIRRING;
      else if (this.mistakeCount < threshold) this.crusherState = CrusherState.LOOSENING;
      else this.crusherState = CrusherState.AWAKENED;
    }

    // Visual feedback on state change
    if (this.crusherState !== previousState) {
      this.playCrusherStateTransition(previousState, this.crusherState);
    }
  }

  /** Play visual/audio feedback for crusher state transitions */
  private playCrusherStateTransition(from: CrusherState, to: CrusherState): void {
    const shakeEnabled = SettingsManager.isScreenShakeEnabled();

    if (from === CrusherState.DORMANT) {
      // First mistake - crusher "stirs"
      this.tweens.add({
        targets: this.crusherSprite,
        scaleY: { from: 1.15, to: 1 },
        duration: 150,
        ease: 'Bounce.out',
      });
      if (shakeEnabled) this.mainCamera.shake(100, 0.003);
    }

    if (to === CrusherState.LOOSENING && from === CrusherState.STIRRING) {
      // Second mistake - crusher "loosens"
      this.tweens.add({
        targets: this.crusherSprite,
        scaleY: { from: 1.2, to: 1 },
        duration: 180,
        ease: 'Bounce.out',
      });
      if (shakeEnabled) this.mainCamera.shake(120, 0.005);
    }

    if (to === CrusherState.AWAKENED) {
      // Fully awakened - crusher starts moving
      this.tweens.add({
        targets: this.crusherSprite,
        scaleY: { from: 1.3, to: 1 },
        duration: 200,
        ease: 'Bounce.out',
      });

      // Pulse the stroke to indicate continuous motion begins
      this.tweens.add({
        targets: this.crusherSprite,
        strokeAlpha: { from: 1, to: 0.5 },
        duration: 100,
        yoyo: true,
        repeat: 2,
      });

      if (shakeEnabled) this.mainCamera.shake(150, 0.008);
    }
  }

  private updateCrusherPhysics(): void {
    // Move the crusher body to match visual position
    this.matter.body.setPosition(this.crusherBody, {
      x: LAYOUT.GAME_AREA_CENTER_X,
      y: this.crusherY + CRUSHER.HEIGHT / 2,
    });

    // Update visual elements
    this.crusherSprite.setY(this.crusherY);

    // Update detail element
    this.children.list.forEach((child) => {
      if (child.getData && child.getData('crusherDetail')) {
        (child as Phaser.GameObjects.Rectangle).setY(this.crusherY);
      }
    });

    // Update panic state
    const killZoneY = LAYOUT.FAIL_ZONE_Y - CRUSHER.HEIGHT;
    const panicThreshold = CRUSHER.INITIAL_Y +
      (killZoneY - CRUSHER.INITIAL_Y) * (TIMING.PANIC_THRESHOLD_PERCENT / 100);
    this.isPanicking = this.crusherY >= panicThreshold;

    // Calculate descent percentage for UI
    const totalTravel = killZoneY - CRUSHER.INITIAL_Y;
    const currentProgress = this.crusherY - CRUSHER.INITIAL_Y;
    const descentPercent = Math.max(0, Math.min(100, (currentProgress / totalTravel) * 100));

    // Emit to UI
    this.events.emit('crusherUpdate', {
      y: this.crusherY,
      percent: descentPercent,
      isPanicking: this.isPanicking,
      isOverdrive: this.isOverdrive,
      crusherState: this.crusherState,  // Full state for UI display
      isDormant: this.crusherState === CrusherState.DORMANT,  // Backwards compat
      combo: this.combo,
      penaltyCount: this.penaltyCount,  // For UI to show weight accumulation
    });
  }

  private syncLetterVisuals(): void {
    // Keep letter containers synced with their physics bodies
    this.letterBodies.forEach((letterBody) => {
      if (letterBody.isUsed || !letterBody.container.active) return;

      letterBody.container.setPosition(letterBody.body.position.x, letterBody.body.position.y);

      // Constrain rotation for readability
      let angle = letterBody.body.angle;
      const maxRad = Phaser.Math.DegToRad(LETTER_POOL.MAX_ROTATION);
      if (angle > maxRad) {
        angle = maxRad;
        this.matter.body.setAngle(letterBody.body, angle);
        this.matter.body.setAngularVelocity(letterBody.body, 0);
      } else if (angle < -maxRad) {
        angle = -maxRad;
        this.matter.body.setAngle(letterBody.body, angle);
        this.matter.body.setAngularVelocity(letterBody.body, 0);
      }
      letterBody.container.setRotation(angle);
    });
  }

  private highlightNearCrusher(): void {
    const crusherBottom = this.crusherY + CRUSHER.HEIGHT;
    const highlightDistance = 80;

    this.letterBodies.forEach((letterBody) => {
      if (letterBody.isUsed || !letterBody.container.active) return;

      const distance = letterBody.body.position.y - crusherBottom;
      const textChild = letterBody.container.list[1] as Phaser.GameObjects.Text;

      if (distance < highlightDistance && distance > 0) {
        // Near crusher - radioactive highlight
        if (!letterBody.isPenalty) {
          textChild.setColor('#ccff00');
          textChild.setShadow(0, 0, '#ccff00', 8, true, true);
        }
        letterBody.container.setScale(1.1);
      } else {
        // Reset
        if (!letterBody.isPenalty) {
          const colorVariants = ['#00ff41', '#77ffaa', '#00ee66', '#aaffcc'];
          textChild.setColor(colorVariants[Math.floor(Math.random() * 4)]);
          textChild.setShadow(0, 0, 'transparent', 0);
        }
        letterBody.container.setScale(1);
      }
    });
  }

  /**
   * Debug assist: Show the order in which letters should be typed.
   * Highlights the current expected letter brightly.
   */
  private updateLetterOrderHighlight(): void {
    if (!SettingsManager.isShowLetterOrder()) return;

    // Get the expected next character (skip non-alphanumeric)
    let nextCharIndex = this.typedIndex;
    while (nextCharIndex < this.currentPhrase.text.length) {
      const char = this.currentPhrase.text[nextCharIndex].toUpperCase();
      if (/^[A-Z0-9]$/.test(char)) break;
      nextCharIndex++;
    }
    const expectedChar = this.currentPhrase.text[nextCharIndex]?.toUpperCase();

    // Find the letter body that matches the expected character
    const expectedLetter = this.letterBodies.find(
      lb => lb.char === expectedChar && !lb.isUsed && !lb.isPenalty
    );

    // Highlight expected letter
    this.letterBodies.forEach((letterBody) => {
      if (letterBody.isUsed || !letterBody.container.active || letterBody.isPenalty) return;

      const textChild = letterBody.container.list[1] as Phaser.GameObjects.Text;
      const blockChild = letterBody.container.list[0] as Phaser.GameObjects.Image;

      if (letterBody === expectedLetter) {
        // Strong highlight for expected letter
        textChild.setColor('#ffffff');
        textChild.setShadow(0, 0, '#00ff41', 20, true, true);
        letterBody.container.setScale(1.25);

        // Pulse animation if not already pulsing
        if (!letterBody.container.getData('isPulsing')) {
          letterBody.container.setData('isPulsing', true);
          this.tweens.add({
            targets: letterBody.container,
            scale: { from: 1.25, to: 1.35 },
            duration: 400,
            yoyo: true,
            repeat: -1,
            onStop: () => {
              letterBody.container.setData('isPulsing', false);
            },
          });
        }

        // Tint block to indicate it's the next one
        if (blockChild.setTint) {
          blockChild.setTint(0x00ff41);
        }
      } else {
        // Dim other letters slightly
        textChild.setAlpha(0.6);

        // Stop any pulsing
        if (letterBody.container.getData('isPulsing')) {
          this.tweens.killTweensOf(letterBody.container);
          letterBody.container.setData('isPulsing', false);
          letterBody.container.setScale(1);
        }

        // Clear tint
        if (blockChild.clearTint) {
          blockChild.clearTint();
        }
      }
    });
  }

  private handleWin(): void {
    this.isGameOver = true;

    const totalTime = (Date.now() - this.startTime) / 1000;
    const totalChars = this.currentPhrase.text.replace(/[^A-Z0-9]/gi, '').length;
    const accuracy = Math.floor((totalChars / (totalChars + this.errors)) * 100);

    const stats: GameStats = {
      score: this.calculateScore(accuracy, totalTime),
      accuracy,
      time: totalTime,
      wpm: Math.floor((this.currentPhrase.text.length / 5) / (totalTime / 60)),
      errors: this.errors,
      maxCombo: this.maxCombo,
      lettersTyped: this.typedIndex,
    };

    // Update progress
    const progress = this.registry.get('playerProgress');
    progress.totalScore += stats.score;
    progress.wordsCompleted++;
    this.registry.set('playerProgress', progress);

    // Transition to result
    this.time.delayedCall(500, () => {
      this.scene.stop('UIScene');
      this.scene.start('ResultScene', {
        won: true,
        stats,
        phrase: this.currentPhrase,
      });
    });
  }

  private handleLose(): void {
    if (this.isCompressing) return;
    this.isGameOver = true;
    this.isCompressing = true;

    const totalTime = (Date.now() - this.startTime) / 1000;
    const typedChars = this.currentPhrase.text.slice(0, this.typedIndex).replace(/[^A-Z0-9]/gi, '').length;
    const accuracy = typedChars > 0 ?
      Math.floor((typedChars / (typedChars + this.errors)) * 100) : 0;

    const stats: GameStats = {
      score: Math.floor(this.typedIndex * 25),
      accuracy,
      time: totalTime,
      wpm: Math.floor((this.typedIndex / 5) / (totalTime / 60)),
      errors: this.errors,
      maxCombo: this.maxCombo,
      lettersTyped: this.typedIndex,
    };

    // Camera effects
    if (SettingsManager.isScreenShakeEnabled()) {
      this.mainCamera.shake(500, 0.03);
    }
    this.mainCamera.flash(300, 255, 0, 0, false);

    // Compress remaining letters into "The Bale"
    this.compressIntoBale(() => {
      this.scene.stop('UIScene');
      this.scene.start('ResultScene', {
        won: false,
        stats,
        phrase: this.currentPhrase,
      });
    });
  }

  private compressIntoBale(onComplete: () => void): void {
    // Collect all remaining letter bodies
    const remainingLetters = this.letterBodies.filter(lb => !lb.isUsed && lb.container.active);

    if (remainingLetters.length === 0) {
      this.time.delayedCall(500, onComplete);
      return;
    }

    // Center point for compression (in game area)
    const centerX = LAYOUT.GAME_AREA_CENTER_X;
    const centerY = LAYOUT.FAIL_ZONE_Y - 100;

    // Animate all letters compressing toward center
    remainingLetters.forEach((letterBody, index) => {
      // Remove physics so we can animate freely
      this.matter.world.remove(letterBody.body);

      // Stagger the compression slightly
      this.time.delayedCall(index * 20, () => {
        this.tweens.add({
          targets: letterBody.container,
          x: centerX + Phaser.Math.Between(-30, 30),
          y: centerY + Phaser.Math.Between(-30, 30),
          scaleX: 0.3,
          scaleY: 0.3,
          rotation: Phaser.Math.DegToRad(Phaser.Math.Between(-180, 180)),
          duration: 400,
          ease: 'Power2',
        });
      });
    });

    // After compression, show the bale and transition
    this.time.delayedCall(remainingLetters.length * 20 + 600, () => {
      // Create bale visual
      const bale = this.add.rectangle(centerX, centerY, 80, 80, COLORS.RUST, 1)
        .setStrokeStyle(4, COLORS.ERROR_RED);

      // Add "crushed" text
      this.add.text(centerX, centerY, '☠', {
        fontSize: '40px',
      }).setOrigin(0.5);

      // Drop the bale
      this.tweens.add({
        targets: [bale],
        y: LAYOUT.FAIL_ZONE_Y - 40,
        duration: 300,
        ease: 'Bounce',
        onComplete: () => {
          this.time.delayedCall(500, onComplete);
        },
      });

      // Hide the compressed letters
      remainingLetters.forEach(lb => lb.container.setVisible(false));
    });
  }

  private calculateScore(accuracy: number, time: number): number {
    const baseScore = this.typedIndex * 10;
    const accuracyBonus = accuracy * 5;
    const comboBonus = this.maxCombo * 20;
    const timeBonus = time < 30 ? 500 : 0;

    return Math.floor(baseScore + accuracyBonus + comboBonus + timeBonus);
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    // Check if pause has expired
    if (this.isPaused && this.time.now >= this.pauseUntil) {
      this.isPaused = false;
    }

    // Delta time in seconds for percentage-per-second calculations
    const deltaSeconds = delta / 1000;
    const killZoneY = LAYOUT.FAIL_ZONE_Y - CRUSHER.HEIGHT;

    // Handle crusher movement based on state
    if (!this.isPaused) {
      if (this.isSliding && this.slideRemaining > 0) {
        // STIRRING or LOOSENING: slow slide that stops
        const slideSpeed = this.percentToPixels(CRUSHER.AWAKENING.SLIDE_SPEED_PERCENT) * deltaSeconds;
        const slideAmount = Math.min(slideSpeed, this.slideRemaining);

        this.crusherY = Math.min(killZoneY, this.crusherY + slideAmount);
        this.slideRemaining -= slideAmount;

        // Slide complete
        if (this.slideRemaining <= 0) {
          this.isSliding = false;
          this.slideRemaining = 0;
        }
      } else if (this.crusherState === CrusherState.AWAKENED) {
        // AWAKENED: continuous descent with adaptive acceleration
        const difficulty = this.getDifficulty();
        const progress = this.registry.get('playerProgress');

        // Base descent rate (% per second)
        const baseDescentPercent = CRUSHER.BASE_DESCENT_PERCENT[difficulty];

        // Weight acceleration: each penalty letter compounds the dread
        const weightAccelPercent = CRUSHER.WEIGHT_ACCELERATION_PERCENT[difficulty];
        const weightMultiplier = 1 + (this.penaltyCount * weightAccelPercent / 100);

        // Stage multiplier (future campaign progression)
        const stageMultiplier = 1 + (progress.stage - 1) * CRUSHER.STAGE_SPEED_MULTIPLIER;

        // Overdrive slows/reverses descent
        const direction = this.isOverdrive ? -0.3 : 1;

        // Calculate final descent in pixels
        const descentPercent = baseDescentPercent * weightMultiplier * stageMultiplier * direction;
        const descentPixels = this.percentToPixels(descentPercent) * deltaSeconds;

        this.crusherY += descentPixels;
      }
    }

    // Clamp crusher position
    this.crusherY = Phaser.Math.Clamp(
      this.crusherY,
      CRUSHER.INITIAL_Y,
      killZoneY
    );

    // Update physics and visuals
    this.updateCrusherPhysics();
    this.applyPenaltyGravity();
    this.syncLetterVisuals();
    this.highlightNearCrusher();
    this.updateLetterOrderHighlight();

    // Check for loss
    if (this.crusherY >= killZoneY) {
      this.handleLose();
    }
  }
}
