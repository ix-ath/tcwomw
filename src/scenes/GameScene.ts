/**
 * GAME SCENE
 * Core gameplay: typing words while the crusher descends.
 * 
 * Architecture:
 * - GameScene handles the main game objects and coordination
 * - Systems (InputSystem, CrusherSystem, etc.) handle specific logic
 * - Events decouple systems for modularity
 */

import Phaser from 'phaser';
import { 
  COLORS, 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  CRUSHER,
  COMBO,
  DIFFICULTY,
  LETTER_POOL,
  TIMING,
  PARTICLES
} from '../constants';
import { 
  Difficulty, 
  GameEvents, 
  GameStats, 
  LetterEntity, 
  Phrase, 
  WordTier 
} from '../types';
import { getRandomPhrase, scrambleLetters } from '@utils/wordUtils';

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
  
  // Game objects
  private crusher!: Phaser.GameObjects.Rectangle;
  private crusherY: number = 0;
  private letterPool: LetterEntity[] = [];
  private letterSprites: Map<string, Phaser.GameObjects.Text> = new Map();
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
    this.createCrusher();
    this.createLetterPool();
    this.createTargetDisplay();
    this.createParticleSystems();
    this.setupInput();
    this.setupEventListeners();
    
    this.mainCamera = this.cameras.main;
    this.startTime = Date.now();
  }

  private resetState(): void {
    this.typedIndex = 0;
    this.errors = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.isPanicking = false;
    this.isOverdrive = false;
    this.isGameOver = false;
    this.crusherY = (CRUSHER.INITIAL_Y_PERCENT / 100) * GAME_HEIGHT;
    this.letterSprites.clear();
  }

  private setupPhrase(): void {
    const difficulty = this.registry.get('selectedDifficulty') as Difficulty || Difficulty.EASY;
    this.currentPhrase = getRandomPhrase(difficulty);
  }

  private createCrusher(): void {
    // The crusher is a simple rectangle for now
    // Will be replaced with physics body for coin-pusher mechanics
    this.crusher = this.add.rectangle(
      GAME_WIDTH / 2,
      this.crusherY,
      CRUSHER.WIDTH,
      CRUSHER.HEIGHT,
      COLORS.TERMINAL_GREEN
    ).setStrokeStyle(4, COLORS.GREEN_LIGHT);
    
    // Add some visual detail
    const crusherDetail = this.add.rectangle(
      GAME_WIDTH / 2,
      this.crusherY,
      CRUSHER.WIDTH - 20,
      CRUSHER.HEIGHT - 10,
      0x000000,
      0.3
    );
    
    // Group crusher elements
    this.crusher.setData('detail', crusherDetail);
  }

  private createLetterPool(): void {
    // Get letters from phrase (excluding spaces/punctuation for display)
    const chars = this.currentPhrase.text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    this.letterPool = scrambleLetters(chars);

    // Create text objects for each letter
    this.letterPool.forEach(letter => {
      const colorVariants = [
        COLORS.TERMINAL_GREEN_CSS,
        '#77ffaa',
        '#00ee66',
        '#aaffcc',
      ];
      
      const text = this.add.text(
        (letter.x / 100) * GAME_WIDTH,
        (letter.y / 100) * GAME_HEIGHT,
        letter.char,
        {
          fontFamily: 'VT323, monospace',
          fontSize: `${LETTER_POOL.FONT_SIZE}px`,
          color: colorVariants[letter.colorIndex % colorVariants.length],
        }
      ).setOrigin(0.5).setRotation(Phaser.Math.DegToRad(letter.rotation));

      this.letterSprites.set(letter.id, text);
    });
  }

  private createTargetDisplay(): void {
    this.targetDisplay = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 120);
    this.updateTargetDisplay();
  }

  private updateTargetDisplay(): void {
    this.targetDisplay.removeAll(true);
    
    const words = this.currentPhrase.text.split(' ');
    let globalCharIndex = 0;
    let xOffset = 0;
    const charWidth = 40;
    const charHeight = 50;
    const wordGap = 30;
    
    // Calculate total width for centering
    const totalWidth = words.reduce((sum, word, i) => {
      return sum + word.length * charWidth + (i < words.length - 1 ? wordGap : 0);
    }, 0);
    
    let currentX = -totalWidth / 2;

    words.forEach((word, wordIndex) => {
      word.split('').forEach((char, charIndex) => {
        const absoluteIndex = globalCharIndex;
        const isTyped = absoluteIndex < this.typedIndex;
        const isCurrent = absoluteIndex === this.typedIndex;
        const isAlphanumeric = /^[A-Z0-9]$/i.test(char);
        
        // Character box
        const box = this.add.rectangle(
          currentX + charWidth / 2,
          0,
          charWidth - 4,
          charHeight,
          0x000000,
          isAlphanumeric ? 1 : 0.3
        ).setStrokeStyle(
          isCurrent ? 4 : 2,
          isTyped ? COLORS.TERMINAL_GREEN : 
          isCurrent ? COLORS.OVERDRIVE_WHITE : 
          COLORS.UI_DIM
        );

        // Character text (only show if typed)
        if (isTyped || !isAlphanumeric) {
          const charText = this.add.text(
            currentX + charWidth / 2,
            0,
            char.toUpperCase(),
            {
              fontFamily: 'VT323, monospace',
              fontSize: '36px',
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

        this.targetDisplay.add(box);
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
    // Success particles
    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      lifespan: PARTICLES.LIFETIME_MS,
      gravityY: 200,
      emitting: false,
    });

    // Error particles (red)
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
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.isGameOver) return;
      if (event.repeat) return; // Ignore held keys
      
      const key = event.key.toUpperCase();
      
      // Only process single characters
      if (key.length !== 1) return;
      
      this.processInput(key);
    });
  }

  private processInput(key: string): void {
    const currentChar = this.currentPhrase.text[this.typedIndex]?.toUpperCase();
    
    if (!currentChar) return;
    
    // Check if current character should be auto-completed (space, punctuation)
    if (!/^[A-Z0-9]$/.test(currentChar)) {
      this.typedIndex++;
      this.updateTargetDisplay();
      this.processInput(key); // Recurse to check next character
      return;
    }
    
    if (key === currentChar) {
      this.handleCorrectInput(key);
    } else {
      this.handleWrongInput(key, currentChar);
    }
  }

  private handleCorrectInput(char: string): void {
    this.typedIndex++;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    
    // Lift the crusher
    const liftAmount = CRUSHER.LIFT_PER_CORRECT + (this.combo * CRUSHER.LIFT_COMBO_BONUS);
    this.crusherY = Math.max(
      (CRUSHER.INITIAL_Y_PERCENT / 100) * GAME_HEIGHT,
      this.crusherY - liftAmount
    );
    
    // Check for overdrive
    if (this.combo >= COMBO.OVERDRIVE_THRESHOLD && !this.isOverdrive) {
      this.triggerOverdrive();
    }
    
    // Mark letter as used in pool
    this.markLetterUsed(char);
    
    // Spawn particles at crusher
    this.particles.emitParticleAt(
      GAME_WIDTH / 2 + Phaser.Math.Between(-100, 100),
      this.crusherY,
      PARTICLES.CORRECT_COUNT
    );
    
    // Update display
    this.updateTargetDisplay();
    this.updateCrusherPosition();
    
    // Emit event for UI/audio
    this.events.emit(GameEvents.CORRECT_LETTER, { char, index: this.typedIndex, combo: this.combo });
    
    // Check for phrase completion
    if (this.typedIndex >= this.currentPhrase.text.length) {
      this.handleWin();
    }
  }

  private handleWrongInput(pressed: string, expected: string): void {
    this.errors++;
    this.combo = 0;
    this.isOverdrive = false;
    
    // Drop the crusher
    this.crusherY = Math.min(
      (CRUSHER.KILL_ZONE_PERCENT / 100) * GAME_HEIGHT,
      this.crusherY + CRUSHER.PENALTY_DROP
    );
    
    // Screen shake
    this.mainCamera.shake(TIMING.SCREEN_SHAKE_DURATION_MS, 0.01);
    
    // Error particles
    this.errorParticles.emitParticleAt(
      GAME_WIDTH / 2 + Phaser.Math.Between(-150, 150),
      this.crusherY,
      PARTICLES.ERROR_COUNT
    );
    
    // Flash effect on crusher
    this.tweens.add({
      targets: this.crusher,
      fillColor: { from: COLORS.ERROR_RED, to: COLORS.TERMINAL_GREEN },
      duration: TIMING.ERROR_FLASH_DURATION_MS,
    });
    
    // Update display
    this.updateCrusherPosition();
    
    // Emit event
    this.events.emit(GameEvents.WRONG_LETTER, { expected, received: pressed, index: this.typedIndex });
  }

  private markLetterUsed(char: string): void {
    // Find first unused letter matching this character
    const letter = this.letterPool.find(l => l.char === char && !l.isUsed);
    if (letter) {
      letter.isUsed = true;
      
      const sprite = this.letterSprites.get(letter.id);
      if (sprite) {
        // Animate letter disappearing
        this.tweens.add({
          targets: sprite,
          alpha: 0,
          scale: 0,
          duration: 200,
          onComplete: () => sprite.setVisible(false),
        });
      }
    }
  }

  private triggerOverdrive(): void {
    this.isOverdrive = true;
    
    // Visual feedback
    this.mainCamera.flash(500, 0, 255, 65, false);
    
    // Kinetic pulse - big lift
    const pulseAmount = ((CRUSHER.KILL_ZONE_PERCENT - CRUSHER.INITIAL_Y_PERCENT) / 100) * GAME_HEIGHT * (COMBO.KINETIC_PULSE_PERCENT / 100);
    this.crusherY = Math.max(
      (CRUSHER.INITIAL_Y_PERCENT / 100) * GAME_HEIGHT,
      this.crusherY - pulseAmount
    );
    this.updateCrusherPosition();
    
    // End overdrive after duration
    this.time.delayedCall(COMBO.OVERDRIVE_DURATION_MS, () => {
      this.isOverdrive = false;
    });
    
    this.events.emit(GameEvents.CRUSHER_OVERDRIVE);
  }

  private updateCrusherPosition(): void {
    this.crusher.setY(this.crusherY);
    const detail = this.crusher.getData('detail') as Phaser.GameObjects.Rectangle;
    if (detail) {
      detail.setY(this.crusherY);
    }
    
    // Update panic state
    const panicThreshold = (TIMING.PANIC_THRESHOLD_PERCENT / 100) * (CRUSHER.KILL_ZONE_PERCENT / 100) * GAME_HEIGHT;
    this.isPanicking = this.crusherY >= panicThreshold;
    
    // Emit to UI
    this.events.emit('crusherUpdate', {
      y: this.crusherY,
      percent: (this.crusherY / GAME_HEIGHT) * 100,
      isPanicking: this.isPanicking,
      isOverdrive: this.isOverdrive,
      combo: this.combo,
    });
  }

  private handleWin(): void {
    this.isGameOver = true;
    
    const totalTime = (Date.now() - this.startTime) / 1000;
    const accuracy = Math.floor(
      (this.currentPhrase.text.replace(/[^A-Z0-9]/gi, '').length / 
      (this.currentPhrase.text.replace(/[^A-Z0-9]/gi, '').length + this.errors)) * 100
    );
    
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
        phrase: this.currentPhrase 
      });
    });
  }

  private handleLose(): void {
    this.isGameOver = true;
    
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
    
    // Camera effect
    this.mainCamera.shake(500, 0.03);
    this.mainCamera.flash(300, 255, 0, 0, false);
    
    this.time.delayedCall(1000, () => {
      this.scene.stop('UIScene');
      this.scene.start('ResultScene', { 
        won: false, 
        stats, 
        phrase: this.currentPhrase 
      });
    });
  }

  private calculateScore(accuracy: number, time: number): number {
    const baseScore = this.typedIndex * 10;
    const accuracyBonus = accuracy * 5;
    const comboBonus = this.maxCombo * 20;
    const timeBonus = time < 30 ? 500 : 0;
    
    return Math.floor(baseScore + accuracyBonus + comboBonus + timeBonus);
  }

  private setupEventListeners(): void {
    // Listen for UI events if needed
  }

  update(time: number, delta: number): void {
    if (this.isGameOver) return;
    
    // Crusher descent
    const difficulty = this.registry.get('selectedDifficulty') as Difficulty || Difficulty.EASY;
    const diffSettings = DIFFICULTY[difficulty];
    const progress = this.registry.get('playerProgress');
    
    const baseSpeed = CRUSHER.BASE_DESCENT_SPEED;
    const stageMultiplier = 1 + (progress.stage - 1) * CRUSHER.STAGE_SPEED_MULTIPLIER;
    const diffMultiplier = diffSettings.speedMultiplier;
    
    // Overdrive reverses direction slightly
    const direction = this.isOverdrive ? -0.3 : 1;
    
    const speed = baseSpeed * stageMultiplier * diffMultiplier * direction * (delta / 16.67);
    this.crusherY += speed;
    
    // Clamp and check kill zone
    this.crusherY = Phaser.Math.Clamp(
      this.crusherY,
      (CRUSHER.INITIAL_Y_PERCENT / 100) * GAME_HEIGHT,
      (CRUSHER.KILL_ZONE_PERCENT / 100) * GAME_HEIGHT
    );
    
    this.updateCrusherPosition();
    
    // Check for loss
    if (this.crusherY >= (CRUSHER.KILL_ZONE_PERCENT / 100) * GAME_HEIGHT) {
      this.handleLose();
    }
    
    // Update letter highlighting based on proximity to crusher
    this.updateLetterHighlighting();
  }

  private updateLetterHighlighting(): void {
    const crusherYPercent = (this.crusherY / GAME_HEIGHT) * 100;
    
    this.letterPool.forEach(letter => {
      if (letter.isUsed) return;
      
      const sprite = this.letterSprites.get(letter.id);
      if (!sprite) return;
      
      const distance = Math.abs(letter.y - crusherYPercent);
      
      if (distance < 8) {
        // Near crusher - radioactive highlight
        sprite.setColor('#ccff00');
        sprite.setScale(1.15);
        sprite.setShadow(0, 0, '#ccff00', 10, true, true);
      } else {
        // Reset to normal
        const colorVariants = ['#00ff41', '#77ffaa', '#00ee66', '#aaffcc'];
        sprite.setColor(colorVariants[letter.colorIndex % colorVariants.length]);
        sprite.setScale(1);
        sprite.setShadow(0, 0, 'transparent', 0);
      }
    });
  }
}
