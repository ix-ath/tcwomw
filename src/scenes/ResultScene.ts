/**
 * RESULT SCENE
 * Displays after a round ends (win or lose).
 * Shows stats, badges, and options to continue or return to menu.
 * Handles campaign progression (chapter/story completion, restart on loss).
 */

import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { GameStats, Phrase } from '../types';
import { CampaignManager, PageOutcome } from '@systems/CampaignManager';

interface CampaignProgress {
  storyTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  totalChapters: number;
  pageNumber: number;
  totalPages: number;
  isBossPage: boolean;
}

interface ResultSceneData {
  won: boolean;
  stats: GameStats;
  phrase: Phrase;
  isCampaign?: boolean;
  campaignProgress?: CampaignProgress | null;
}

export class ResultScene extends Phaser.Scene {
  private won: boolean = false;
  private stats!: GameStats;
  private phrase!: Phrase;
  private isCampaign: boolean = false;
  private campaignProgress: CampaignProgress | null = null;
  private pageOutcome: PageOutcome | null = null;

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: ResultSceneData): void {
    this.won = data.won;
    this.stats = data.stats;
    this.phrase = data.phrase;
    this.isCampaign = data.isCampaign || false;
    this.campaignProgress = data.campaignProgress || null;
    this.pageOutcome = null;

    // Process campaign progression
    if (this.isCampaign && CampaignManager.isActive()) {
      this.pageOutcome = CampaignManager.completePage({
        won: this.won,
        score: this.stats.score,
        time: this.stats.time,
        errors: this.stats.errors,
        isPerfect: this.stats.accuracy === 100,
      });
    }
  }

  create(): void {
    this.createBackground();
    this.createTitle();
    this.createCampaignProgress();
    this.createPhraseDisplay();
    this.createStatsGrid();
    this.createBadges();
    this.createTotalScore();
    this.createButtons();
    this.setupInput();
  }

  private createBackground(): void {
    // Semi-transparent overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.95);
    
    // Main container
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 800, 550, 0x000000)
      .setStrokeStyle(4, this.won ? COLORS.TERMINAL_GREEN : COLORS.ERROR_RED);
  }

  private createTitle(): void {
    let title: string;
    let subtitle: string | null = null;
    const color = this.won ? COLORS.TERMINAL_GREEN_CSS : '#ff0000';

    // Determine title based on campaign outcome
    if (this.pageOutcome) {
      switch (this.pageOutcome.type) {
        case 'nextPage':
          title = 'CLEARED';
          break;
        case 'chapterComplete':
          title = 'CHAPTER COMPLETE';
          subtitle = this.pageOutcome.nextChapter
            ? `Next: ${this.pageOutcome.nextChapter.title}`
            : null;
          break;
        case 'storyComplete':
          title = 'STORY COMPLETE';
          subtitle = 'The night shift never ends...';
          break;
        case 'chapterFailed':
          title = 'CRUSHED';
          subtitle = `Restart: ${this.pageOutcome.restartChapter.title}`;
          break;
      }
    } else {
      title = this.won ? 'CLEARED' : 'SIGNAL LOST';
    }

    const titleText = this.add.text(GAME_WIDTH / 2, 110, title, {
      fontFamily: 'VT323, monospace',
      fontSize: '64px',
      color: color,
    }).setOrigin(0.5);

    titleText.setShadow(0, 0, color, 15, true, true);

    // Show subtitle if present
    if (subtitle) {
      this.add.text(GAME_WIDTH / 2, 150, subtitle, {
        fontFamily: 'VT323, monospace',
        fontSize: '24px',
        color: '#aaaaaa',
      }).setOrigin(0.5);
    }

    if (!this.won) {
      // Glitch effect for loss
      this.tweens.add({
        targets: titleText,
        x: { from: GAME_WIDTH / 2 - 5, to: GAME_WIDTH / 2 + 5 },
        duration: 50,
        yoyo: true,
        repeat: 5,
      });
    }

    // Special effect for story complete
    if (this.pageOutcome?.type === 'storyComplete') {
      this.cameras.main.flash(1000, 0, 255, 65, false);
    }
  }

  private createCampaignProgress(): void {
    if (!this.isCampaign || !this.campaignProgress) return;

    const { chapterTitle, chapterNumber, totalChapters, pageNumber, totalPages, isBossPage } = this.campaignProgress;

    // Chapter progress bar
    const barWidth = 300;
    const barHeight = 20;
    const barX = GAME_WIDTH / 2;
    const barY = 175;

    // Background
    this.add.rectangle(barX, barY, barWidth, barHeight, 0x222222)
      .setStrokeStyle(1, COLORS.UI_DIM);

    // Progress fill
    const progress = pageNumber / totalPages;
    const fillWidth = (barWidth - 4) * progress;
    this.add.rectangle(barX - barWidth / 2 + 2 + fillWidth / 2, barY, fillWidth, barHeight - 4, COLORS.TERMINAL_GREEN);

    // Chapter label
    const chapterLabel = `Chapter ${chapterNumber}/${totalChapters}: ${chapterTitle}`;
    this.add.text(barX, barY - 18, chapterLabel, {
      fontFamily: 'VT323, monospace',
      fontSize: '16px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

    // Page progress
    const pageLabel = isBossPage ? `BOSS (${pageNumber}/${totalPages})` : `Page ${pageNumber}/${totalPages}`;
    this.add.text(barX, barY + 18, pageLabel, {
      fontFamily: 'VT323, monospace',
      fontSize: '14px',
      color: isBossPage ? '#ffaa00' : '#888888',
    }).setOrigin(0.5);

    // Scrap awarded (if any)
    if (this.pageOutcome && 'scrapAwarded' in this.pageOutcome && this.pageOutcome.scrapAwarded > 0) {
      this.add.text(barX + 180, barY, `+${this.pageOutcome.scrapAwarded}`, {
        fontFamily: 'VT323, monospace',
        fontSize: '18px',
        color: '#ffaa00',
      }).setOrigin(0, 0.5);
    }
  }

  private createPhraseDisplay(): void {
    // Adjust Y position if campaign progress is shown
    const phraseY = this.isCampaign ? 230 : 190;

    // Label
    this.add.text(GAME_WIDTH / 2, phraseY, 'DECRYPTED PHRASE:', {
      fontFamily: 'VT323, monospace',
      fontSize: '18px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.5);
    
    // The phrase
    const phraseColor = this.won ? '#ffffff' : '#ff0000';
    const phraseText = this.add.text(GAME_WIDTH / 2, phraseY + 40, `"${this.phrase.text}"`, {
      fontFamily: 'VT323, monospace',
      fontSize: '32px',
      color: phraseColor,
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5);
    
    if (!this.won) {
      this.tweens.add({
        targets: phraseText,
        alpha: { from: 1, to: 0.6 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createStatsGrid(): void {
    const startY = 300;
    const stats = [
      { label: 'ACCURACY', value: `${this.stats.accuracy}%` },
      { label: 'THROUGHPUT', value: `${this.stats.wpm} WPM` },
      { label: 'REWARD', value: `${this.stats.score}` },
    ];
    
    const boxWidth = 200;
    const spacing = 220;
    const startX = GAME_WIDTH / 2 - spacing;
    
    stats.forEach((stat, index) => {
      const x = startX + index * spacing;
      
      // Box
      this.add.rectangle(x, startY, boxWidth, 80, 0x000000)
        .setStrokeStyle(2, COLORS.UI_DIM);
      
      // Label
      this.add.text(x, startY - 20, stat.label, {
        fontFamily: 'VT323, monospace',
        fontSize: '16px',
        color: COLORS.TERMINAL_GREEN_CSS,
      }).setOrigin(0.5).setAlpha(0.6);
      
      // Value
      const valueColor = stat.label === 'REWARD' ? COLORS.TERMINAL_GREEN_CSS : '#ffffff';
      this.add.text(x, startY + 10, stat.value, {
        fontFamily: 'VT323, monospace',
        fontSize: '36px',
        color: valueColor,
      }).setOrigin(0.5);
    });
  }

  private createBadges(): void {
    const badges: { icon: string; label: string }[] = [];
    
    if (this.stats.accuracy === 100) {
      badges.push({ icon: '🎯', label: 'FLAWLESS' });
    }
    if (this.stats.wpm > 60) {
      badges.push({ icon: '⚡', label: 'OVERCLOCK' });
    }
    if (this.stats.score > 3000) {
      badges.push({ icon: '💎', label: 'LEGEND' });
    }
    if (this.stats.maxCombo >= 20) {
      badges.push({ icon: '🔥', label: 'KINETIC' });
    }
    
    if (badges.length === 0) return;
    
    const badgeY = 380;
    const badgeSpacing = 150;
    const startX = GAME_WIDTH / 2 - ((badges.length - 1) * badgeSpacing) / 2;
    
    badges.forEach((badge, index) => {
      const x = startX + index * badgeSpacing;
      
      // Badge container
      const container = this.add.container(x, badgeY);
      
      const bg = this.add.rectangle(0, 0, 130, 40, 0x000000, 0.5)
        .setStrokeStyle(2, 0xeab308);
      
      const icon = this.add.text(-45, 0, badge.icon, {
        fontSize: '24px',
      }).setOrigin(0.5);
      
      const label = this.add.text(15, 0, badge.label, {
        fontFamily: 'VT323, monospace',
        fontSize: '18px',
        color: '#eab308',
      }).setOrigin(0.5);
      
      container.add([bg, icon, label]);
      
      // Pop-in animation
      container.setScale(0);
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 300,
        delay: 200 + index * 100,
        ease: 'Back.easeOut',
      });
    });
  }

  private createTotalScore(): void {
    const progress = this.registry.get('playerProgress');
    
    this.add.text(GAME_WIDTH / 2, 440, 'CAREER TRANSMISSION SCORE:', {
      fontFamily: 'VT323, monospace',
      fontSize: '24px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.7);
    
    const scoreText = this.add.text(GAME_WIDTH / 2, 475, progress.totalScore.toString(), {
      fontFamily: 'VT323, monospace',
      fontSize: '48px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);
    
    scoreText.setShadow(0, 0, COLORS.TERMINAL_GREEN_CSS, 10, true, true);
  }

  private createButtons(): void {
    const buttonY = 550;
    
    if (this.won) {
      // Continue button
      this.createButton(GAME_WIDTH / 2 - 150, buttonY, 'STRENGTHEN SIGNAL', COLORS.TERMINAL_GREEN, true, () => {
        this.continueGame();
      });
      
      // Menu button
      this.createButton(GAME_WIDTH / 2 + 150, buttonY, 'DISCONNECT', COLORS.TERMINAL_GREEN, false, () => {
        this.returnToMenu();
      });
    } else {
      // Retry button
      this.createButton(GAME_WIDTH / 2 - 120, buttonY, 'RE-INITIATE', COLORS.ERROR_RED, false, () => {
        this.retryGame();
      });
      
      // Menu button
      this.createButton(GAME_WIDTH / 2 + 120, buttonY, 'DISCONNECT', COLORS.TERMINAL_GREEN, false, () => {
        this.returnToMenu();
      });
    }
    
    // Key hints
    const hintText = this.won
      ? '[SPACE/ENTER] CONTINUE  \u2022  [ESC] MENU'
      : '[ENTER] RETRY  \u2022  [ESC] MENU';
    this.add.text(GAME_WIDTH / 2, 600, hintText, {
      fontFamily: 'VT323, monospace',
      fontSize: '16px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.4);
  }

  private createButton(x: number, y: number, text: string, color: number, filled: boolean, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 220, 50, filled ? color : 0x000000)
      .setStrokeStyle(3, color);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'VT323, monospace',
      fontSize: '20px',
      color: filled ? '#000000' : (color === COLORS.ERROR_RED ? '#ff0000' : COLORS.TERMINAL_GREEN_CSS),
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    
    // Interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setFillStyle(color, 1);
        label.setColor('#000000');
      })
      .on('pointerout', () => {
        bg.setFillStyle(filled ? color : 0x000000, 1);
        label.setColor(filled ? '#000000' : (color === COLORS.ERROR_RED ? '#ff0000' : COLORS.TERMINAL_GREEN_CSS));
      })
      .on('pointerdown', callback);
    
    container.setData('callback', callback);
    
    return container;
  }

  private setupInput(): void {
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.won) this.continueGame();
    });
    
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.won) {
        this.continueGame();
      } else {
        this.retryGame();
      }
    });
    
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToMenu();
    });
  }

  private continueGame(): void {
    // Handle campaign progression
    if (this.isCampaign && this.pageOutcome) {
      switch (this.pageOutcome.type) {
        case 'nextPage':
        case 'chapterComplete':
          // Continue to next page/chapter
          this.scene.start('GameScene');
          this.scene.launch('UIScene');
          return;

        case 'storyComplete':
          // Return to break room after story completion
          CampaignManager.endCampaign();
          this.scene.start('BreakRoomScene');
          return;

        case 'chapterFailed':
          // Retry chapter (handled by retryGame)
          this.retryGame();
          return;
      }
    }

    // Non-campaign: Increment stage and continue
    const progress = this.registry.get('playerProgress');
    progress.stage++;
    this.registry.set('playerProgress', progress);

    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  private retryGame(): void {
    // Campaign mode: chapter restart is already handled by CampaignManager
    if (this.isCampaign) {
      // CampaignManager.completePage() already reset to chapter start on failure
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
      return;
    }

    // Non-campaign: Reset progress for fresh start
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

    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  private returnToMenu(): void {
    // End campaign if active
    if (CampaignManager.isActive()) {
      CampaignManager.endCampaign();
    }
    this.scene.start('BreakRoomScene');
  }
}
