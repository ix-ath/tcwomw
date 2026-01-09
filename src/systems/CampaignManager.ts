/**
 * CampaignManager - Orchestrates campaign progression through stories, chapters, and pages.
 *
 * Responsibilities:
 * - Load stories from JSON files
 * - Track current story, chapter, and page position
 * - Provide current page data to GameScene
 * - Handle page/chapter/story transitions
 * - Coordinate with SaveManager for persistence
 */

import type {
  StoryData,
  ChapterData,
  PageData,
  Phrase,
  Difficulty,
} from '../types';
import { WordTier } from '../types';
import { SaveManager } from './SaveManager';

// Import story data
import tutorialStory from '../data/stories/tutorial.json';
import mainCampaignStory from '../data/stories/main-campaign.json';

/** Current campaign state */
interface CampaignState {
  storyId: string | null;
  story: StoryData | null;
  chapterIndex: number;
  pageIndex: number;          // Current page within chapter
  isActive: boolean;
  errorsThisPage: number;     // Track errors for scrap calculation on loss
  errorsThisChapter: number;  // Track errors for chapter failure scrap
}

/** Result of completing a page */
export interface PageResult {
  won: boolean;
  score: number;
  time: number;
  errors: number;
  isPerfect: boolean;
}

/** What happens after a page completes */
export type PageOutcome =
  | { type: 'nextPage'; page: PageData }
  | { type: 'chapterComplete'; nextChapter: ChapterData | null; scrapAwarded: number }
  | { type: 'storyComplete'; scrapAwarded: number }
  | { type: 'chapterFailed'; restartChapter: ChapterData; scrapAwarded: number };

/**
 * CampaignManager singleton for managing campaign state.
 */
class CampaignManagerClass {
  private state: CampaignState = {
    storyId: null,
    story: null,
    chapterIndex: 0,
    pageIndex: 0,
    isActive: false,
    errorsThisPage: 0,
    errorsThisChapter: 0,
  };

  // Story cache (loaded from JSON)
  private stories: Map<string, StoryData> = new Map();

  constructor() {
    this.loadStories();
  }

  /**
   * Load all available stories into memory.
   */
  private loadStories(): void {
    // Load built-in stories
    this.stories.set('tutorial', tutorialStory as StoryData);
    this.stories.set('main-campaign', mainCampaignStory as StoryData);

    console.log(`[CampaignManager] Loaded ${this.stories.size} stories`);
  }

  /**
   * Get list of available stories.
   */
  getAvailableStories(): StoryData[] {
    return Array.from(this.stories.values());
  }

  /**
   * Get a specific story by ID.
   */
  getStory(storyId: string): StoryData | null {
    return this.stories.get(storyId) || null;
  }

  /**
   * Start a campaign (story).
   * Resumes from saved progress if available.
   */
  startCampaign(storyId: string): boolean {
    const story = this.stories.get(storyId);
    if (!story) {
      console.error(`[CampaignManager] Story not found: ${storyId}`);
      return false;
    }

    // Get or create progress
    const progress = SaveManager.initStoryProgress(storyId);

    this.state = {
      storyId,
      story,
      chapterIndex: progress.currentChapterIndex,
      pageIndex: 0,  // Always start at first page of current chapter
      isActive: true,
      errorsThisPage: 0,
      errorsThisChapter: 0,
    };

    console.log(`[CampaignManager] Started campaign: ${story.title}, chapter ${this.state.chapterIndex + 1}/${story.chapters.length}`);
    return true;
  }

  /**
   * Start a specific chapter (for chapter select or restart).
   */
  startChapter(storyId: string, chapterIndex: number): boolean {
    const story = this.stories.get(storyId);
    if (!story || chapterIndex < 0 || chapterIndex >= story.chapters.length) {
      console.error(`[CampaignManager] Invalid chapter: ${storyId}[${chapterIndex}]`);
      return false;
    }

    // Ensure progress exists
    SaveManager.initStoryProgress(storyId);

    this.state = {
      storyId,
      story,
      chapterIndex,
      pageIndex: 0,
      isActive: true,
      errorsThisPage: 0,
      errorsThisChapter: 0,
    };

    console.log(`[CampaignManager] Started chapter: ${story.chapters[chapterIndex].title}`);
    return true;
  }

  /**
   * Check if a campaign is currently active.
   */
  isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Get current story data.
   */
  getCurrentStory(): StoryData | null {
    return this.state.story;
  }

  /**
   * Get current chapter data.
   */
  getCurrentChapter(): ChapterData | null {
    if (!this.state.story) return null;
    return this.state.story.chapters[this.state.chapterIndex] || null;
  }

  /**
   * Get current chapter index.
   */
  getCurrentChapterIndex(): number {
    return this.state.chapterIndex;
  }

  /**
   * Get current page index within chapter.
   */
  getCurrentPageIndex(): number {
    return this.state.pageIndex;
  }

  /**
   * Get total pages in current chapter.
   */
  getTotalPagesInChapter(): number {
    const chapter = this.getCurrentChapter();
    return chapter ? chapter.pages.length : 0;
  }

  /**
   * Get current page data.
   */
  getCurrentPage(): PageData | null {
    const chapter = this.getCurrentChapter();
    if (!chapter) return null;
    return chapter.pages[this.state.pageIndex] || null;
  }

  /**
   * Convert PageData to Phrase format for GameScene.
   * This bridges the campaign system to the existing game mechanics.
   */
  getCurrentPageAsPhrase(): Phrase | null {
    const page = this.getCurrentPage();
    if (!page) return null;

    // Map difficulty string to enum
    const difficultyMap: Record<string, Difficulty> = {
      'EASY': 'EASY' as Difficulty,
      'MEDIUM': 'MEDIUM' as Difficulty,
      'HARD': 'HARD' as Difficulty,
      'EXPERT': 'EXPERT' as Difficulty,
    };

    // Determine word tier based on text content
    const text = page.text;
    let tier: WordTier;
    if (text.length <= 4 && !text.includes(' ')) {
      tier = WordTier.COMMAND;
    } else if (text.length <= 6 && !text.includes(' ')) {
      tier = WordTier.SIGHT_WORDS;
    } else if (!text.includes(' ')) {
      tier = WordTier.SINGLE_WORDS;
    } else if (text.split(' ').length <= 4) {
      tier = WordTier.PHRASES;
    } else {
      tier = WordTier.BLOCK_TEXT;
    }

    return {
      text: page.text,
      category: page.theme,
      difficulty: difficultyMap[page.difficulty] || ('MEDIUM' as Difficulty),
      tier,
      tag: page.tags?.[0],
      hints: page.hints,
    };
  }

  /**
   * Record an error on the current page.
   * Called by GameScene when player makes a mistake.
   */
  recordError(): void {
    this.state.errorsThisPage++;
    this.state.errorsThisChapter++;
  }

  /**
   * Handle page completion (win or lose).
   * Returns what should happen next.
   */
  completePage(result: PageResult): PageOutcome {
    const { story, chapterIndex, pageIndex } = this.state;
    if (!story) {
      throw new Error('[CampaignManager] No active campaign');
    }

    const chapter = story.chapters[chapterIndex];
    const page = chapter.pages[pageIndex];
    const storyId = this.state.storyId!;
    const chapterId = chapter.id;

    if (!result.won) {
      // LOSS: Restart chapter, award scrap
      const scrapAwarded = this.calculateFailureScrap();
      SaveManager.failChapter(storyId, chapterId, this.state.errorsThisChapter);

      // Reset to chapter start
      this.state.pageIndex = 0;
      this.state.errorsThisPage = 0;
      this.state.errorsThisChapter = 0;

      console.log(`[CampaignManager] Chapter failed. Awarded ${scrapAwarded} scrap. Restarting chapter.`);

      return {
        type: 'chapterFailed',
        restartChapter: chapter,
        scrapAwarded,
      };
    }

    // WIN: Check if this was the last page in chapter
    const isLastPage = pageIndex >= chapter.pages.length - 1;
    const isBossPage = page.isBoss === true;

    if (isLastPage || isBossPage) {
      // Chapter complete!
      const isPerfectChapter = this.state.errorsThisChapter === 0;
      SaveManager.completeChapter(storyId, chapterId, result.score, result.time, isPerfectChapter);

      // Calculate chapter completion bonus
      const scrapBonus = this.calculateChapterCompletionScrap(isPerfectChapter);
      SaveManager.addScrap(scrapBonus);

      // Advance to next chapter
      const nextChapterIndex = chapterIndex + 1;
      const isStoryComplete = nextChapterIndex >= story.chapters.length;

      if (isStoryComplete) {
        // Story complete!
        SaveManager.completeStory(storyId);

        // Mark tutorial as complete if this was the tutorial
        if (story.isTutorial) {
          SaveManager.completeTutorial();
        }

        this.state.isActive = false;

        console.log(`[CampaignManager] Story complete: ${story.title}. Awarded ${scrapBonus} bonus scrap.`);

        return {
          type: 'storyComplete',
          scrapAwarded: scrapBonus,
        };
      }

      // Advance to next chapter
      SaveManager.advanceChapter(storyId, nextChapterIndex);
      this.state.chapterIndex = nextChapterIndex;
      this.state.pageIndex = 0;
      this.state.errorsThisPage = 0;
      this.state.errorsThisChapter = 0;

      const nextChapter = story.chapters[nextChapterIndex];
      console.log(`[CampaignManager] Chapter complete. Next: ${nextChapter.title}. Awarded ${scrapBonus} bonus scrap.`);

      return {
        type: 'chapterComplete',
        nextChapter,
        scrapAwarded: scrapBonus,
      };
    }

    // Advance to next page in chapter
    this.state.pageIndex++;
    this.state.errorsThisPage = 0;
    const nextPage = chapter.pages[this.state.pageIndex];

    console.log(`[CampaignManager] Page complete. Next page: ${this.state.pageIndex + 1}/${chapter.pages.length}`);

    return {
      type: 'nextPage',
      page: nextPage,
    };
  }

  /**
   * Calculate scrap awarded for chapter failure.
   * Design: 1 scrap per error + 5-10 base bale bonus.
   */
  private calculateFailureScrap(): number {
    const errorScrap = this.state.errorsThisChapter;
    const baleBonus = 5 + Math.floor(Math.random() * 6); // 5-10
    return errorScrap + baleBonus;
  }

  /**
   * Calculate bonus scrap for chapter completion.
   * Design: Base bonus + perfect run bonus.
   */
  private calculateChapterCompletionScrap(isPerfect: boolean): number {
    let bonus = 10; // Base completion bonus

    if (isPerfect) {
      bonus += 25; // Perfect chapter bonus
    }

    // Boss chapters give more
    const page = this.getCurrentPage();
    if (page?.isBoss) {
      bonus += 15;
    }

    return bonus;
  }

  /**
   * End the current campaign (quit to menu).
   */
  endCampaign(): void {
    console.log('[CampaignManager] Campaign ended');
    this.state = {
      storyId: null,
      story: null,
      chapterIndex: 0,
      pageIndex: 0,
      isActive: false,
      errorsThisPage: 0,
      errorsThisChapter: 0,
    };
  }

  /**
   * Get campaign progress summary for UI.
   */
  getProgressSummary(): {
    storyTitle: string;
    chapterTitle: string;
    chapterNumber: number;
    totalChapters: number;
    pageNumber: number;
    totalPages: number;
    isBossPage: boolean;
  } | null {
    const story = this.state.story;
    const chapter = this.getCurrentChapter();
    const page = this.getCurrentPage();

    if (!story || !chapter || !page) return null;

    return {
      storyTitle: story.title,
      chapterTitle: chapter.title,
      chapterNumber: this.state.chapterIndex + 1,
      totalChapters: story.chapters.length,
      pageNumber: this.state.pageIndex + 1,
      totalPages: chapter.pages.length,
      isBossPage: page.isBoss === true,
    };
  }
}

// Export singleton instance
export const CampaignManager = new CampaignManagerClass();

// Also export class for testing
export { CampaignManagerClass };
