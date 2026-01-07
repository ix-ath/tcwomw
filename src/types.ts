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
}

/** Word/phrase tiers from design doc */
export enum WordTier {
  COMMAND = 0,      // LOGIN, START, OOPS
  SIGHT_WORDS = 1,  // Grade K, 2-4 chars
  SINGLE_WORDS = 2, // 5-12 chars
  PHRASES = 3,      // 2-3 word phrases
  BLOCK_TEXT = 4,   // Full sentences/paragraphs
}

/** Crusher state machine */
export enum CrusherState {
  DORMANT = 'DORMANT',     // Not moving, waiting for first mistake
  AWAKENED = 'AWAKENED',   // Active, descending after first mistake
}

// =============================================================================
// GAME DATA
// =============================================================================

export interface Phrase {
  text: string;
  category: string;
  difficulty: Difficulty;
  tier: WordTier;
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
  
  // Economy (future)
  scrip: number;
  scrapCollected: number;
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
// SAVE DATA (future)
// =============================================================================

export interface SaveData {
  version: string;
  progress: PlayerProgress;
  config: GameConfig;
  stats: {
    totalPlayTime: number;
    totalWordsTyped: number;
    totalErrors: number;
    bestWPM: number;
    pitLetterCount: number;  // The Pit of Failure
    balesCreated: number;    // Trash cubes from losses
  };
}
