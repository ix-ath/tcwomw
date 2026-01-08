/**
 * TUTORIAL SCENE
 *
 * A scripted tutorial experience that teaches core mechanics:
 * 1. Basic typing (ON, START)
 * 2. Wrong-position highlighting (OOPS shown as OOSP)
 * 3. Failure has value (impossible sentence)
 * 4. The Pit and Cube Scrap economy
 * 5. Helpers (Theme unlock)
 *
 * Uses the ScriptedEvent framework for flexible, data-driven sequences.
 */

import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import {
  ScriptRunner,
  ScriptDefinition,
  ScriptStep,
  DialogueStep,
  PageStep,
  OverlayStep,
  AwardStep,
} from '../systems/ScriptedEvent';
import { SaveManager } from '../systems/SaveManager';

// Import tutorial script
import tutorialScript from '../data/scripts/tutorial.json';

export class TutorialScene extends Phaser.Scene {
  private scriptRunner!: ScriptRunner;
  private dialogueContainer!: Phaser.GameObjects.Container;
  private overlayContainer!: Phaser.GameObjects.Container;
  private gameContainer!: Phaser.GameObjects.Container;

  // Typing game state
  private currentText: string = '';
  private typedIndex: number = 0;
  private letterDisplays: Phaser.GameObjects.Text[] = [];
  private boardLetters: Phaser.GameObjects.Container[] = [];
  private currentPageStep: PageStep | null = null;
  private errorCount: number = 0;

  constructor() {
    super({ key: 'TutorialScene' });
  }

  create(): void {
    this.createBackground();
    this.createContainers();
    this.initScriptRunner();
    this.setupInput();

    // Start the tutorial
    this.scriptRunner.start();
  }

  private createBackground(): void {
    // Dark factory background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a0a);

    // Subtle vignette effect
    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.8, 0.8);
    vignette.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private createContainers(): void {
    // Container for typing game elements
    this.gameContainer = this.add.container(0, 0).setVisible(false);

    // Container for dialogue overlays
    this.dialogueContainer = this.add.container(0, 0).setVisible(false).setDepth(100);

    // Container for full-screen overlays (Pit, shop)
    this.overlayContainer = this.add.container(0, 0).setVisible(false).setDepth(200);
  }

  private initScriptRunner(): void {
    this.scriptRunner = new ScriptRunner(tutorialScript as ScriptDefinition, {
      scene: this,
      flags: new Map(),
      onStepStart: (step) => this.handleStepStart(step),
      onStepEnd: (step) => this.handleStepEnd(step),
      onScriptEnd: () => this.handleScriptEnd(),
    });
  }

  private setupInput(): void {
    // Global key handler for advancing dialogue
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const step = this.scriptRunner.getCurrentStep();

      if (step?.type === 'dialogue') {
        const dialogueStep = step as DialogueStep;
        if (dialogueStep.dismissOn === 'key' || dialogueStep.dismissOn === 'any') {
          this.dismissDialogue();
        }
      } else if (step?.type === 'wait') {
        this.scriptRunner.resume();
      } else if (step?.type === 'page') {
        this.handleTypingInput(event.key);
      }
    });

    // Click handler
    this.input.on('pointerdown', () => {
      const step = this.scriptRunner.getCurrentStep();

      if (step?.type === 'dialogue') {
        const dialogueStep = step as DialogueStep;
        if (dialogueStep.dismissOn === 'click' || dialogueStep.dismissOn === 'any') {
          this.dismissDialogue();
        }
      } else if (step?.type === 'wait') {
        this.scriptRunner.resume();
      }
    });
  }

  // ===========================================================================
  // STEP HANDLERS
  // ===========================================================================

  private handleStepStart(step: ScriptStep): void {
    switch (step.type) {
      case 'dialogue':
        this.showDialogue(step as DialogueStep);
        break;
      case 'page':
        this.startPage(step as PageStep);
        break;
      case 'overlay':
        this.showOverlay(step as OverlayStep);
        break;
      case 'award':
        this.showAward(step as AwardStep);
        break;
    }
  }

  private handleStepEnd(step: ScriptStep): void {
    switch (step.type) {
      case 'dialogue':
        this.dialogueContainer.setVisible(false);
        break;
      case 'page':
        this.gameContainer.setVisible(false);
        break;
      case 'overlay':
        this.overlayContainer.setVisible(false);
        break;
    }
  }

  private handleScriptEnd(): void {
    // Mark tutorial as completed
    SaveManager.completeTutorial();
    console.log('[TutorialScene] Tutorial completed!');
  }

  // ===========================================================================
  // DIALOGUE
  // ===========================================================================

  private showDialogue(step: DialogueStep): void {
    this.dialogueContainer.removeAll(true);

    // Background panel
    const panelY = step.position === 'top' ? 100 :
                   step.position === 'bottom' ? GAME_HEIGHT - 100 :
                   GAME_HEIGHT / 2;

    const bg = this.add.rectangle(GAME_WIDTH / 2, panelY, 800, 120, 0x000000, 0.9)
      .setStrokeStyle(2, COLORS.TERMINAL_GREEN);

    // Speaker name (if any)
    let textY = panelY;
    if (step.speaker) {
      const speaker = this.add.text(GAME_WIDTH / 2 - 380, panelY - 40, step.speaker, {
        fontFamily: 'VT323, monospace',
        fontSize: '18px',
        color: COLORS.TERMINAL_GREEN_CSS,
      });
      this.dialogueContainer.add(speaker);
      textY += 10;
    }

    // Dialogue text
    const text = this.add.text(GAME_WIDTH / 2, textY, step.text, {
      fontFamily: 'VT323, monospace',
      fontSize: '28px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 750 },
    }).setOrigin(0.5);

    // Prompt
    const prompt = this.add.text(GAME_WIDTH / 2, panelY + 45, '[ PRESS ANY KEY ]', {
      fontFamily: 'VT323, monospace',
      fontSize: '14px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.5);

    // Blink the prompt
    this.tweens.add({
      targets: prompt,
      alpha: { from: 0.5, to: 0.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.dialogueContainer.add([bg, text, prompt]);
    this.dialogueContainer.setVisible(true);

    // Auto-dismiss if configured
    if (step.dismissOn === 'auto' && step.autoDelay) {
      this.time.delayedCall(step.autoDelay, () => {
        this.dismissDialogue();
      });
    }
  }

  private dismissDialogue(): void {
    this.dialogueContainer.setVisible(false);
    this.scriptRunner.resume();
  }

  // ===========================================================================
  // PAGE (TYPING GAME)
  // ===========================================================================

  private startPage(step: PageStep): void {
    this.currentPageStep = step;
    this.currentText = step.text.toUpperCase();
    this.typedIndex = 0;
    this.errorCount = 0;

    this.gameContainer.removeAll(true);
    this.letterDisplays = [];
    this.boardLetters = [];

    // Create the board with scattered letters
    this.createLetterBoard(step);

    // Create the blank display at bottom
    this.createBlankDisplay(step);

    // Show theme if helper is equipped
    if (step.theme && SaveManager.isHelperEquipped('theme')) {
      this.createThemeDisplay(step.theme, step.tags);
    }

    this.gameContainer.setVisible(true);
  }

  private createLetterBoard(step: PageStep): void {
    // Get letters to display (forceScramble overrides normal order)
    const displayOrder = step.forceScramble || this.shuffleString(this.currentText.replace(/\s/g, ''));

    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2 - 50;
    const spreadX = 300;
    const spreadY = 100;

    for (let i = 0; i < displayOrder.length; i++) {
      const char = displayOrder[i];
      if (char === ' ') continue;

      const x = centerX + (Math.random() - 0.5) * spreadX * 2;
      const y = centerY + (Math.random() - 0.5) * spreadY * 2;
      const rotation = (Math.random() - 0.5) * 0.3; // ±15 degrees in radians

      const container = this.add.container(x, y);

      const bg = this.add.rectangle(0, 0, 50, 60, 0x1a1a1a)
        .setStrokeStyle(2, COLORS.TERMINAL_GREEN);

      const text = this.add.text(0, 0, char, {
        fontFamily: 'VT323, monospace',
        fontSize: '36px',
        color: COLORS.TERMINAL_GREEN_CSS,
      }).setOrigin(0.5);

      container.add([bg, text]);
      container.setRotation(rotation);
      container.setData('char', char);
      container.setData('used', false);

      this.boardLetters.push(container);
      this.gameContainer.add(container);
    }
  }

  private createBlankDisplay(_step: PageStep): void {
    const y = GAME_HEIGHT - 120;
    let x = GAME_WIDTH / 2;

    // Calculate total width
    const charWidth = 40;
    const wordGap = 20;
    const words = this.currentText.split(' ');
    const totalWidth = words.reduce((sum, word) => sum + word.length * charWidth, 0) +
                       (words.length - 1) * wordGap;

    x = (GAME_WIDTH - totalWidth) / 2 + charWidth / 2;

    for (const word of words) {
      for (let i = 0; i < word.length; i++) {
        const bg = this.add.rectangle(x, y, charWidth - 4, 50, 0x0a0a0a)
          .setStrokeStyle(1, COLORS.UI_DIM);

        const text = this.add.text(x, y, '_', {
          fontFamily: 'VT323, monospace',
          fontSize: '32px',
          color: '#333333',
        }).setOrigin(0.5);

        this.gameContainer.add([bg, text]);
        this.letterDisplays.push(text);

        x += charWidth;
      }
      x += wordGap;
    }
  }

  private createThemeDisplay(theme: string, tags?: string[]): void {
    const y = GAME_HEIGHT - 50;
    let displayText = theme.toUpperCase();

    if (tags && tags.length > 0 && SaveManager.isHelperEquipped('tag')) {
      displayText += ` • ${tags[0]}`;
    }

    const themeText = this.add.text(GAME_WIDTH / 2, y, displayText, {
      fontFamily: 'VT323, monospace',
      fontSize: '20px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.7);

    this.gameContainer.add(themeText);
  }

  private handleTypingInput(key: string): void {
    if (!this.currentPageStep) return;

    const expectedChar = this.getNextExpectedChar();
    if (!expectedChar) return;

    const typedChar = key.toUpperCase();

    // Skip spaces automatically
    if (expectedChar === ' ') {
      this.advanceTyping(expectedChar);
      this.handleTypingInput(key); // Recursively check next
      return;
    }

    // Check if valid letter key
    if (!/^[A-Z]$/.test(typedChar)) return;

    if (typedChar === expectedChar) {
      // Correct!
      this.handleCorrectLetter(typedChar);
    } else {
      // Wrong!
      this.handleWrongLetter(typedChar, expectedChar);
    }
  }

  private getNextExpectedChar(): string | null {
    const textNoSpaces = this.currentText;
    let charIndex = 0;

    for (let i = 0; i < textNoSpaces.length; i++) {
      if (textNoSpaces[i] === ' ') {
        // Skip spaces in counting
        continue;
      }
      if (charIndex === this.typedIndex) {
        return textNoSpaces[i];
      }
      charIndex++;
    }

    return null;
  }

  private advanceTyping(char: string): void {
    // Find the letter display index (excluding spaces)
    let displayIndex = 0;
    for (let i = 0; i < this.currentText.length; i++) {
      if (this.currentText[i] === ' ') continue;
      if (displayIndex === this.typedIndex) {
        break;
      }
      displayIndex++;
    }

    // Update display
    if (this.letterDisplays[displayIndex]) {
      this.letterDisplays[displayIndex].setText(char);
      this.letterDisplays[displayIndex].setColor('#ffffff');
    }

    this.typedIndex++;
  }

  private handleCorrectLetter(char: string): void {
    // Find and "use" a board letter
    for (const container of this.boardLetters) {
      if (container.getData('char') === char && !container.getData('used')) {
        container.setData('used', true);

        // Animate letter disappearing
        this.tweens.add({
          targets: container,
          alpha: 0,
          scale: 0.5,
          duration: 200,
        });
        break;
      }
    }

    // Update blank display
    this.advanceTyping(char);

    // Check if complete
    const totalChars = this.currentText.replace(/\s/g, '').length;
    if (this.typedIndex >= totalChars) {
      this.handlePageComplete(true);
    }
  }

  private handleWrongLetter(typed: string, _expected: string): void {
    this.errorCount++;
    SaveManager.recordError(); // Awards 1 scrap

    // Screen shake
    this.cameras.main.shake(100, 0.01);

    // Flash red
    this.cameras.main.flash(100, 255, 0, 0, false, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress === 1) {
        // Check if the typed letter exists elsewhere (wrong position)
        const remaining = this.currentText.slice(this.typedIndex).replace(/\s/g, '');
        if (remaining.includes(typed)) {
          this.highlightWrongPosition(typed);
        }
      }
    });

    // Check for failure on "impossible" sentence
    if (this.currentPageStep?.allowFailure && this.errorCount >= 3) {
      this.handlePageComplete(false);
    }
  }

  private highlightWrongPosition(char: string): void {
    for (const container of this.boardLetters) {
      if (container.getData('char') === char && !container.getData('used')) {
        const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
        const originalStroke = bg.strokeColor;

        // Yellow highlight
        bg.setStrokeStyle(3, 0xffff00);

        this.time.delayedCall(1000, () => {
          if (bg.active) {
            bg.setStrokeStyle(2, originalStroke);
          }
        });
        break;
      }
    }
  }

  private handlePageComplete(success: boolean): void {
    this.gameContainer.setVisible(false);

    if (this.currentPageStep) {
      const nextStep = success
        ? this.currentPageStep.onSuccess
        : this.currentPageStep.onFailure;

      this.scriptRunner.resume(nextStep);
    }
  }

  // ===========================================================================
  // OVERLAY
  // ===========================================================================

  private showOverlay(step: OverlayStep): void {
    this.overlayContainer.removeAll(true);

    // Full screen dim
    const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.9);

    // Panel
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 600, 400, 0x0a0a0a)
      .setStrokeStyle(3, COLORS.TERMINAL_GREEN);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, step.title || '', {
      fontFamily: 'VT323, monospace',
      fontSize: '36px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

    // Body
    const body = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, step.body || '', {
      fontFamily: 'VT323, monospace',
      fontSize: '20px',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: 500 },
      lineSpacing: 8,
    }).setOrigin(0.5);

    this.overlayContainer.add([dim, panel, title, body]);

    // Options/buttons
    if (step.options && step.options.length > 0) {
      const buttonY = GAME_HEIGHT / 2 + 140;

      step.options.forEach((opt, index) => {
        const btn = this.add.rectangle(GAME_WIDTH / 2, buttonY + index * 50, 250, 40, 0x000000)
          .setStrokeStyle(2, COLORS.TERMINAL_GREEN)
          .setInteractive({ useHandCursor: true });

        const btnText = this.add.text(GAME_WIDTH / 2, buttonY + index * 50, opt.label, {
          fontFamily: 'VT323, monospace',
          fontSize: '20px',
          color: COLORS.TERMINAL_GREEN_CSS,
        }).setOrigin(0.5);

        btn.on('pointerover', () => {
          btn.setFillStyle(COLORS.TERMINAL_GREEN);
          btnText.setColor('#000000');
        });

        btn.on('pointerout', () => {
          btn.setFillStyle(0x000000);
          btnText.setColor(COLORS.TERMINAL_GREEN_CSS);
        });

        btn.on('pointerdown', () => {
          this.overlayContainer.setVisible(false);
          this.scriptRunner.resume(opt.goto);
        });

        this.overlayContainer.add([btn, btnText]);
      });
    } else if (step.dismissable) {
      // Simple dismiss prompt
      const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160, '[ CLICK TO CONTINUE ]', {
        fontFamily: 'VT323, monospace',
        fontSize: '16px',
        color: COLORS.TERMINAL_GREEN_CSS,
      }).setOrigin(0.5).setAlpha(0.5);

      dim.setInteractive().on('pointerdown', () => {
        this.overlayContainer.setVisible(false);
        this.scriptRunner.resume();
      });

      this.overlayContainer.add(prompt);
    }

    this.overlayContainer.setVisible(true);
  }

  // ===========================================================================
  // AWARD
  // ===========================================================================

  private showAward(step: AwardStep): void {
    if (step.message) {
      // Show brief message, then continue
      const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, step.message, {
        fontFamily: 'VT323, monospace',
        fontSize: '24px',
        color: COLORS.TERMINAL_GREEN_CSS,
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
      }).setOrigin(0.5).setDepth(300);

      this.time.delayedCall(1500, () => {
        msg.destroy();
        this.scriptRunner.resume();
      });
    }
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  private shuffleString(str: string): string {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }
}
