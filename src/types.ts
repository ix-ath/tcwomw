/**
 * GAME TYPES
 * All TypeScript interfaces and types for the game.
 */

// =============================================================================
// ENUMS
// =============================================================================

export enum GameState {
  BOOT = 'BOOT',
  PRELOAD = 'PRELOAD',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  WIN = 'WIN',
  LOSE = 'LOSE',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

/** Word/phrase tiers from design doc */
export enum WordTier {
  COMMAND = 0,      // LOGIN, START, OOPS
  SIGHT_WORDS = 1,  // Grade K, 2-4 chars
  SINGLE_WORDS = 2, // 5-12 chars
  PHRASES = 3,      // 2-3 word phrases
  BLOCK_TEXT = 4,   // Full sentences/paragraphs
}

/** Crusher state machine - graduated awakening ("loosening up") */
export enum CrusherState {
  DORMANT = 'DORMANT',       // Not moving, waiting for first mistake
  STIRRING = 'STIRRING',     // 1st mistake: small shove, then stops
  LOOSENING = 'LOOSENING',   // 2nd mistake: bigger shove, then stops
  AWAKENED = 'AWAKENED',     // 3rd+ mistakes: continuous descent
}

// =============================================================================
// GAME DATA
// =============================================================================

export interface Phrase {
  text: string;
  category: string;
  difficulty: Difficulty;
  tier: WordTier;
  tag?: string;           // Single-word hint shown to player
  hints?: string[];       // Optional hint phrases (for hint system)
}

/** Raw word entry from JSON data files */
export interface WordEntry {
  text: string;
  theme: string;
  tag?: string;              // Single tag (legacy format)
  tags?: string[];           // Multiple tags (new format)
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  audience?: string;         // Age range e.g. "KIDS 5+", "TEENS 13+", "GENERAL"
  hints?: string[];
}

/** Word data file structure */
export interface WordDataFile {
  version?: string;
  words: WordEntry[];
}

// =============================================================================
// CAMPAIGN DATA STRUCTURES
// =============================================================================

/**
 * A single page in a chapter - one word/phrase/sentence to complete.
 * Extends the WordEntry format with campaign-specific fields.
 */
export interface PageData {
  text: string;              // The word/phrase/sentence to type
  theme: string;             // Category shown to player (e.g., "Food", "Greetings")
  tags?: string[];           // First tag shown as hint (e.g., "FOOD • fruit")
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  hints?: string[];          // Optional hint phrases for hint system

  // Campaign-specific
  isBoss?: boolean;          // True for chapter/story boss pages
  narrativeNote?: string;    // Internal dev note about story beat (not shown to player)
}

/**
 * A chapter is a thematic unit containing multiple pages.
 * Loss = restart chapter (not entire story).
 */
export interface ChapterData {
  id: string;                // Unique within story (e.g., "ch1-arrival")
  title: string;             // Display name (e.g., "The Arrival")
  description?: string;      // Flavor text shown before chapter starts
  pages: PageData[];         // All pages including boss (boss has isBoss: true)
}

/**
 * A story is a complete narrative arc - the main campaign or a Workshop upload.
 * Each story is stored as a separate JSON file for Workshop support.
 */
export interface StoryData {
  id: string;                // Unique identifier (e.g., "main-campaign", "tutorial")
  version: string;           // Schema version for future migrations
  title: string;             // Display name
  author: string;            // Creator name (for Workshop attribution)
  description?: string;      // Story blurb/synopsis
  difficulty: 'BEGINNER' | 'STANDARD' | 'CHALLENGING' | 'MASTERY';
  chapters: ChapterData[];

  // Story flags
  isTutorial?: boolean;      // Special tutorial handling
  isMainCampaign?: boolean;  // The primary story

  // Workshop metadata (future)
  workshopId?: string;       // Steam Workshop ID when uploaded
  createdAt?: string;        // ISO date string
  updatedAt?: string;        // ISO date string
  tags?: string[];           // For Workshop filtering/search
}

/**
 * Index file that lists all available stories.
 * Used to discover stories without loading each file.
 */
export interface StoryIndex {
  version: string;
  stories: StoryIndexEntry[];
}

export interface StoryIndexEntry {
  id: string;                // Matches StoryData.id
  file: string;              // Relative path to JSON file
  title: string;             // For display without loading full file
  author: string;
  difficulty: 'BEGINNER' | 'STANDARD' | 'CHALLENGING' | 'MASTERY';
  chapterCount: number;      // Quick stats
  isMainCampaign?: boolean;
  isTutorial?: boolean;
}

export interface GameStats {
  score: number;
  accuracy: number;       // 0-100
  time: number;           // seconds
  wpm: number;
  errors: number;
  maxCombo: number;
  lettersTyped: number;
}

export interface PlayerProgress {
  totalScore: number;
  stage: number;
  wordsCompleted: number;

  // Machine repair status (future)
  hydraulicsRepair: number;  // 0-100
  steamVentRepair: number;   // 0-100
  brassGearsRepair: number;  // 0-100
}

// =============================================================================
// ECONOMY & PROGRESSION
// =============================================================================

/** Helper/upgrade categories from design doc */
export type HelperCategory = 'VISION' | 'TIMING' | 'FORGIVENESS' | 'ENDGAME';

/** Definition of a purchasable helper/upgrade */
export interface HelperDefinition {
  id: string;                // Unique identifier (e.g., "theme", "keep-highlight-1")
  name: string;              // Display name
  description: string;       // What it does
  cost: number;              // Cube scrap cost
  category: HelperCategory;
  tier?: number;             // For upgrades with multiple levels (Keep Highlight I/II/III)
  prerequisite?: string;     // Helper ID that must be unlocked first
}

/** Cube scrap economy state */
export interface EconomyState {
  cubeScrap: number;         // Current spendable balance
  lifetimeScrap: number;     // The Pit - total ever earned, never decreases
}

/** Progress within a single chapter */
export interface ChapterProgressData {
  completed: boolean;
  completedAt?: string;      // ISO date string
  bestScore?: number;
  bestTime?: number;         // Seconds
  perfectRun?: boolean;      // Completed with no mistakes
  deathCount: number;        // Times failed this chapter
}

/** Progress within a story */
export interface StoryProgressData {
  storyId: string;
  currentChapterIndex: number;  // Where player left off
  chapters: Record<string, ChapterProgressData>;  // Keyed by chapter ID
  completed: boolean;
  completedAt?: string;
}

// =============================================================================
// ENTITIES
// =============================================================================

export interface LetterEntity {
  id: string;
  char: string;
  x: number;
  y: number;
  rotation: number;
  colorIndex: number;
  isUsed: boolean;
  
  // For physics-enabled letters (future)
  bodyId?: number;
}

export interface PenaltyLetter extends LetterEntity {
  mass: number;
  velocity: { x: number; y: number };
}

// =============================================================================
// UI
// =============================================================================

export interface HUDState {
  crusherY: number;
  combo: number;
  isPanicking: boolean;
  isOverdrive: boolean;
  stage: number;
  currentWordIndex: number;
  totalWords: number;
}

// =============================================================================
// EVENTS
// =============================================================================

/** Custom game events for decoupled systems */
export enum GameEvents {
  // Input events
  CORRECT_LETTER = 'correct_letter',
  WRONG_LETTER = 'wrong_letter',
  WORD_COMPLETE = 'word_complete',
  PHRASE_COMPLETE = 'phrase_complete',
  
  // Game state events
  GAME_START = 'game_start',
  GAME_PAUSE = 'game_pause',
  GAME_RESUME = 'game_resume',
  GAME_WIN = 'game_win',
  GAME_LOSE = 'game_lose',
  
  // Crusher events
  CRUSHER_LIFT = 'crusher_lift',
  CRUSHER_DROP = 'crusher_drop',
  CRUSHER_PANIC = 'crusher_panic',
  CRUSHER_OVERDRIVE = 'crusher_overdrive',
  
  // Combo events
  COMBO_INCREMENT = 'combo_increment',
  COMBO_RESET = 'combo_reset',
  KINETIC_PULSE = 'kinetic_pulse',
  
  // VFX events
  SPAWN_PARTICLES = 'spawn_particles',
  SCREEN_SHAKE = 'screen_shake',
  ERROR_FLASH = 'error_flash',
  
  // Audio events
  PLAY_SFX = 'play_sfx',
  PITCH_UP = 'pitch_up',
  PITCH_RESET = 'pitch_reset',
}

/** Payload types for events */
export interface EventPayloads {
  [GameEvents.CORRECT_LETTER]: { char: string; index: number; combo: number };
  [GameEvents.WRONG_LETTER]: { expected: string; received: string; index: number };
  [GameEvents.WORD_COMPLETE]: { word: string; wordIndex: number };
  [GameEvents.PHRASE_COMPLETE]: { stats: GameStats };
  [GameEvents.CRUSHER_LIFT]: { amount: number };
  [GameEvents.CRUSHER_DROP]: { amount: number };
  [GameEvents.SPAWN_PARTICLES]: { x: number; y: number; count: number; color?: number };
  [GameEvents.SCREEN_SHAKE]: { intensity: number; duration: number };
  [GameEvents.PLAY_SFX]: { key: string; pitch?: number };
}

// =============================================================================
// CONFIG
// =============================================================================

export interface GameConfig {
  difficulty: Difficulty;
  soundEnabled: boolean;
  musicEnabled: boolean;
  screenShakeEnabled: boolean;
  
  // Accessibility (future)
  highContrastMode: boolean;
  reducedMotion: boolean;
}

// =============================================================================
// SAVE DATA
// =============================================================================

export interface SaveData {
  version: string;

  // Economy
  economy: EconomyState;

  // Helpers/upgrades
  unlockedHelpers: string[];   // Array of helper IDs that have been purchased
  equippedHelpers: string[];   // Currently active helpers (subset of unlocked)

  // Campaign progress
  storyProgress: Record<string, StoryProgressData>;  // Keyed by story ID
  tutorialCompleted: boolean;

  // Settings
  config: GameConfig;

  // Lifetime stats
  stats: {
    totalPlayTime: number;     // Seconds
    totalWordsTyped: number;
    totalLettersTyped: number;
    totalErrors: number;
    bestWPM: number;
    balesCreated: number;      // Trash cubes from losses (visual in The Pit)
    chaptersCompleted: number;
    storiesCompleted: number;
    perfectChapters: number;   // Chapters with no mistakes
  };

  // Metadata
  createdAt: string;           // ISO date string
  lastPlayedAt: string;        // ISO date string
}
