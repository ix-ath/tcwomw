/**
 * SaveManager - Handles persistence of game state to LocalStorage.
 *
 * Manages:
 * - Cube Scrap economy (balance + lifetime/Pit count)
 * - Unlocked and equipped helpers
 * - Story/chapter progress
 * - Player settings and stats
 *
 * Future: Will migrate to Electron store for Steam release.
 */

import type {
  SaveData,
  EconomyState,
  StoryProgressData,
  ChapterProgressData,
  GameConfig,
  Difficulty,
  LetterFrequencies,
} from '../types';

const SAVE_KEY = 'tcwomw_save';
const CURRENT_VERSION = '1.0.0';

/**
 * Creates a fresh save file for new players.
 */
function createDefaultSave(): SaveData {
  const now = new Date().toISOString();

  return {
    version: CURRENT_VERSION,

    economy: {
      cubeScrap: 0,
      lifetimeScrap: 0,
    },

    failedLetters: {},  // The Pit - tracks frequency of each failed letter

    unlockedHelpers: [],
    equippedHelpers: [],

    storyProgress: {},
    tutorialCompleted: false,

    config: {
      difficulty: 'MEDIUM' as Difficulty,
      soundEnabled: true,
      musicEnabled: true,
      screenShakeEnabled: true,
      highContrastMode: false,
      reducedMotion: false,
    },

    stats: {
      totalPlayTime: 0,
      totalWordsTyped: 0,
      totalLettersTyped: 0,
      totalErrors: 0,
      bestWPM: 0,
      balesCreated: 0,
      chaptersCompleted: 0,
      storiesCompleted: 0,
      perfectChapters: 0,
    },

    createdAt: now,
    lastPlayedAt: now,
  };
}

/**
 * Migrates old save data to current version.
 * Add migration logic here as the save format evolves.
 */
function migrateSave(data: SaveData): SaveData {
  // Ensure failedLetters exists (for saves before The Pit feature)
  if (!data.failedLetters) {
    data.failedLetters = {};
    console.log('[SaveManager] Migration: Added failedLetters field');
  }

  data.version = CURRENT_VERSION;
  return data;
}

/**
 * SaveManager singleton for managing game persistence.
 */
class SaveManagerClass {
  private data: SaveData;
  private autoSaveEnabled: boolean = true;

  constructor() {
    this.data = this.load();
  }

  /**
   * Load save data from LocalStorage.
   * Returns default save if none exists or on error.
   */
  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        console.log('[SaveManager] No save found, creating new save');
        return createDefaultSave();
      }

      const parsed = JSON.parse(raw) as SaveData;

      // Migrate if needed
      if (parsed.version !== CURRENT_VERSION) {
        console.log(`[SaveManager] Migrating save from ${parsed.version} to ${CURRENT_VERSION}`);
        return migrateSave(parsed);
      }

      // Always ensure new fields exist (for same-version saves created before field was added)
      if (!parsed.failedLetters) {
        parsed.failedLetters = {};
        console.log('[SaveManager] Added missing failedLetters field');
      }

      console.log('[SaveManager] Save loaded successfully');
      return parsed;
    } catch (error) {
      console.error('[SaveManager] Failed to load save, creating new:', error);
      return createDefaultSave();
    }
  }

  /**
   * Persist current state to LocalStorage.
   */
  save(): void {
    try {
      this.data.lastPlayedAt = new Date().toISOString();
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      console.log('[SaveManager] Save successful');
    } catch (error) {
      console.error('[SaveManager] Failed to save:', error);
    }
  }

  /**
   * Auto-save if enabled. Call after state changes.
   */
  private autoSave(): void {
    if (this.autoSaveEnabled) {
      this.save();
    }
  }

  // ===========================================================================
  // ECONOMY
  // ===========================================================================

  /** Get current spendable Cube Scrap balance. */
  getCubeScrap(): number {
    return this.data.economy.cubeScrap;
  }

  /** Get lifetime scrap earned (The Pit). Never decreases. */
  getLifetimeScrap(): number {
    return this.data.economy.lifetimeScrap;
  }

  /** Get full economy state. */
  getEconomy(): EconomyState {
    return { ...this.data.economy };
  }

  /**
   * Add Cube Scrap (from errors, chapter losses, etc.)
   * Increases both balance and lifetime count.
   */
  addScrap(amount: number): void {
    if (amount <= 0) return;

    this.data.economy.cubeScrap += amount;
    this.data.economy.lifetimeScrap += amount;
    console.log(`[SaveManager] +${amount} scrap (balance: ${this.data.economy.cubeScrap}, lifetime: ${this.data.economy.lifetimeScrap})`);
    this.autoSave();
  }

  /**
   * Spend Cube Scrap (for purchasing helpers).
   * Returns true if successful, false if insufficient funds.
   */
  spendScrap(amount: number): boolean {
    if (amount <= 0) return true;
    if (this.data.economy.cubeScrap < amount) {
      console.log(`[SaveManager] Insufficient scrap: have ${this.data.economy.cubeScrap}, need ${amount}`);
      return false;
    }

    this.data.economy.cubeScrap -= amount;
    console.log(`[SaveManager] -${amount} scrap (balance: ${this.data.economy.cubeScrap})`);
    this.autoSave();
    return true;
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  /** Get list of unlocked helper IDs. */
  getUnlockedHelpers(): string[] {
    return [...this.data.unlockedHelpers];
  }

  /** Get list of currently equipped helper IDs. */
  getEquippedHelpers(): string[] {
    return [...this.data.equippedHelpers];
  }

  /** Check if a helper is unlocked. */
  isHelperUnlocked(helperId: string): boolean {
    return this.data.unlockedHelpers.includes(helperId);
  }

  /** Check if a helper is equipped. */
  isHelperEquipped(helperId: string): boolean {
    return this.data.equippedHelpers.includes(helperId);
  }

  /**
   * Unlock a helper (does not spend scrap - call spendScrap separately).
   * Returns true if newly unlocked, false if already owned.
   */
  unlockHelper(helperId: string): boolean {
    if (this.isHelperUnlocked(helperId)) {
      return false;
    }

    this.data.unlockedHelpers.push(helperId);
    console.log(`[SaveManager] Unlocked helper: ${helperId}`);
    this.autoSave();
    return true;
  }

  /**
   * Equip a helper (must be unlocked first).
   * Returns true if equipped, false if not unlocked.
   */
  equipHelper(helperId: string): boolean {
    if (!this.isHelperUnlocked(helperId)) {
      console.log(`[SaveManager] Cannot equip ${helperId}: not unlocked`);
      return false;
    }

    if (!this.isHelperEquipped(helperId)) {
      this.data.equippedHelpers.push(helperId);
      console.log(`[SaveManager] Equipped helper: ${helperId}`);
      this.autoSave();
    }
    return true;
  }

  /**
   * Unequip a helper.
   */
  unequipHelper(helperId: string): void {
    const index = this.data.equippedHelpers.indexOf(helperId);
    if (index !== -1) {
      this.data.equippedHelpers.splice(index, 1);
      console.log(`[SaveManager] Unequipped helper: ${helperId}`);
      this.autoSave();
    }
  }

  /**
   * Get count of equipped helpers (for score multiplier calculation).
   */
  getEquippedHelperCount(): number {
    return this.data.equippedHelpers.length;
  }

  // ===========================================================================
  // STORY PROGRESS
  // ===========================================================================

  /** Get progress for a specific story. */
  getStoryProgress(storyId: string): StoryProgressData | null {
    return this.data.storyProgress[storyId] || null;
  }

  /** Initialize progress for a story (first time playing). */
  initStoryProgress(storyId: string): StoryProgressData {
    if (!this.data.storyProgress[storyId]) {
      this.data.storyProgress[storyId] = {
        storyId,
        currentChapterIndex: 0,
        chapters: {},
        completed: false,
      };
      this.autoSave();
    }
    return this.data.storyProgress[storyId];
  }

  /** Get progress for a specific chapter within a story. */
  getChapterProgress(storyId: string, chapterId: string): ChapterProgressData | null {
    const story = this.data.storyProgress[storyId];
    if (!story) return null;
    return story.chapters[chapterId] || null;
  }

  /**
   * Mark a chapter as completed.
   * Updates story progress and stats.
   */
  completeChapter(
    storyId: string,
    chapterId: string,
    score: number,
    time: number,
    isPerfect: boolean
  ): void {
    // Ensure story progress exists
    this.initStoryProgress(storyId);
    const story = this.data.storyProgress[storyId];

    // Initialize or update chapter progress
    const existing = story.chapters[chapterId];
    const now = new Date().toISOString();

    story.chapters[chapterId] = {
      completed: true,
      completedAt: existing?.completedAt || now,
      bestScore: Math.max(existing?.bestScore || 0, score),
      bestTime: existing?.bestTime ? Math.min(existing.bestTime, time) : time,
      perfectRun: existing?.perfectRun || isPerfect,
      deathCount: existing?.deathCount || 0,
    };

    // Update stats if first completion
    if (!existing?.completed) {
      this.data.stats.chaptersCompleted++;
    }

    if (isPerfect && !existing?.perfectRun) {
      this.data.stats.perfectChapters++;
    }

    console.log(`[SaveManager] Chapter completed: ${storyId}/${chapterId} (score: ${score}, perfect: ${isPerfect})`);
    this.autoSave();
  }

  /**
   * Record a chapter failure (death).
   * Awards scrap and increments death counter.
   */
  failChapter(storyId: string, chapterId: string, errorsThisAttempt: number): void {
    this.initStoryProgress(storyId);
    const story = this.data.storyProgress[storyId];

    // Initialize chapter if needed
    if (!story.chapters[chapterId]) {
      story.chapters[chapterId] = {
        completed: false,
        deathCount: 0,
      };
    }

    story.chapters[chapterId].deathCount++;
    this.data.stats.balesCreated++;

    // Award scrap: 1 per error during attempt + 5-10 bonus for the bale
    const baleBonus = 5 + Math.floor(Math.random() * 6); // 5-10
    const totalScrap = errorsThisAttempt + baleBonus;
    this.addScrap(totalScrap);

    console.log(`[SaveManager] Chapter failed: ${storyId}/${chapterId} (deaths: ${story.chapters[chapterId].deathCount}, +${totalScrap} scrap)`);
  }

  /**
   * Advance to next chapter in a story.
   */
  advanceChapter(storyId: string, nextChapterIndex: number): void {
    this.initStoryProgress(storyId);
    this.data.storyProgress[storyId].currentChapterIndex = nextChapterIndex;
    this.autoSave();
  }

  /**
   * Mark a story as completed.
   */
  completeStory(storyId: string): void {
    this.initStoryProgress(storyId);
    const story = this.data.storyProgress[storyId];

    if (!story.completed) {
      story.completed = true;
      story.completedAt = new Date().toISOString();
      this.data.stats.storiesCompleted++;
      console.log(`[SaveManager] Story completed: ${storyId}`);
      this.autoSave();
    }
  }

  /** Mark tutorial as completed. */
  completeTutorial(): void {
    if (!this.data.tutorialCompleted) {
      this.data.tutorialCompleted = true;
      console.log('[SaveManager] Tutorial completed');
      this.autoSave();
    }
  }

  /** Check if tutorial is completed. */
  isTutorialCompleted(): boolean {
    return this.data.tutorialCompleted;
  }

  // ===========================================================================
  // STATS
  // ===========================================================================

  /** Add to play time. */
  addPlayTime(seconds: number): void {
    this.data.stats.totalPlayTime += seconds;
    this.autoSave();
  }

  /** Record word completion. */
  recordWordCompleted(letterCount: number): void {
    this.data.stats.totalWordsTyped++;
    this.data.stats.totalLettersTyped += letterCount;
    this.autoSave();
  }

  /** Record an error. Awards 1 scrap. */
  recordError(): void {
    this.data.stats.totalErrors++;
    this.addScrap(1); // 1 scrap per error
  }

  /** Update best WPM if higher. */
  updateBestWPM(wpm: number): void {
    if (wpm > this.data.stats.bestWPM) {
      this.data.stats.bestWPM = wpm;
      console.log(`[SaveManager] New best WPM: ${wpm}`);
      this.autoSave();
    }
  }

  /** Get all stats. */
  getStats(): SaveData['stats'] {
    return { ...this.data.stats };
  }

  // ===========================================================================
  // THE PIT (Failed Letter Tracking)
  // ===========================================================================

  /** Get all failed letter frequencies for The Pit display. */
  getFailedLetters(): LetterFrequencies {
    return { ...this.data.failedLetters };
  }

  /** Get total count of all failed letters. */
  getTotalFailedLetters(): number {
    return Object.values(this.data.failedLetters).reduce((sum, count) => sum + count, 0);
  }

  /**
   * Record a failed letter (wrong guess).
   * This is separate from recordError() which handles scrap economy.
   */
  recordFailedLetter(char: string): void {
    const letter = char.toUpperCase();
    if (!/^[A-Z0-9]$/.test(letter)) return; // Only track alphanumeric

    if (!this.data.failedLetters[letter]) {
      this.data.failedLetters[letter] = 0;
    }
    this.data.failedLetters[letter]++;
    console.log(`[SaveManager] Failed letter '${letter}' (total: ${this.data.failedLetters[letter]})`);
    this.autoSave();
  }

  /**
   * Get letter frequencies sorted by count (descending).
   * Returns array of [letter, count] tuples.
   */
  getFailedLettersSorted(): [string, number][] {
    return Object.entries(this.data.failedLetters)
      .sort((a, b) => b[1] - a[1]);
  }

  // ===========================================================================
  // CONFIG
  // ===========================================================================

  /** Get current config. */
  getConfig(): GameConfig {
    return { ...this.data.config };
  }

  /** Update config. */
  updateConfig(partial: Partial<GameConfig>): void {
    this.data.config = { ...this.data.config, ...partial };
    this.autoSave();
  }

  // ===========================================================================
  // UTILITY
  // ===========================================================================

  /** Get full save data (for debugging/export). */
  getSaveData(): SaveData {
    return JSON.parse(JSON.stringify(this.data));
  }

  /** Reset all progress (dangerous!). */
  resetProgress(): void {
    console.warn('[SaveManager] Resetting all progress!');
    this.data = createDefaultSave();
    this.save();
  }

  /** Enable/disable auto-save. */
  setAutoSave(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
  }

  /** Force a save. */
  forceSave(): void {
    this.save();
  }
}

// Export singleton instance
export const SaveManager = new SaveManagerClass();

// Also export class for testing
export { SaveManagerClass };
