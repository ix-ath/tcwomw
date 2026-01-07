/**
 * WORD UTILITIES
 * Phrase data, word selection, and letter scrambling.
 */

import { Difficulty, LetterEntity, Phrase, WordTier } from '../types';
import { LETTER_POOL } from '../constants';

// =============================================================================
// PHRASE DATA
// =============================================================================

const EASY_WORDS: string[] = [
  "APPLE", "BEACH", "BRAIN", "BREAD", "BRUSH", "CHAIR", "CHEST", "CHORD", "CLICK", "CLOCK",
  "CLOUD", "DANCE", "DIARY", "DRINK", "DRIVE", "EARTH", "FEAST", "FIELD", "FRUIT", "GLASS",
  "GRAPE", "GREEN", "GHOST", "HEART", "HOUSE", "JUICE", "LIGHT", "LEMON", "MELON", "MONEY",
  "MUSIC", "NIGHT", "OCEAN", "PARTY", "PIANO", "PILOT", "PLANE", "PHONE", "PIZZA", "PLANT",
  "RADIO", "RIVER", "ROBOT", "SHIRT", "SHOES", "SMILE", "SNAKE", "SPACE", "SPOON", "STORM",
  "TABLE", "TIGER", "TOAST", "TOUCH", "TRAIN", "TRUCK", "VOICE", "WATER", "WATCH", "WHALE",
  "WORLD", "WRITE", "YACHT", "ZEBRA", "BREAK", "BRICK", "BUILD", "CANDY", "CARDS", "CLEAN",
  "CLEAR", "COAST", "COINS", "DREAM", "DRESS", "EMPTY", "ENTRY", "FRESH", "FRONT", "GLOVE",
  "GRAND", "GRASS", "GREAT", "HELLO", "IMAGE", "INDEX", "LARGE", "LEARN", "LUCKY", "MAGIC",
  "MOUSE", "MOUTH", "NORTH", "PAPER", "PEACE", "PEARL", "POWER", "PRIZE", "PROUD", "QUEEN"
];

const MEDIUM_PHRASES: Phrase[] = [
  { text: "PRACTICE MAKES PERFECT", category: "Proverb", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "THE MOON IS BRIGHT", category: "Nature", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "LIFE IS A JOURNEY", category: "Poetic", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "KNOWLEDGE IS POWER", category: "Education", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "SILENCE IS GOLDEN", category: "Proverb", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "BENEATH THE SURFACE", category: "Mystery", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "A WORLD APART", category: "Poetic", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "TIME FLIES BY", category: "Wisdom", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "ACTIONS SPEAK LOUDER", category: "Proverb", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "TRUST THE PROCESS", category: "Motivation", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "STAY THE COURSE", category: "Motivation", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "BREAK THE MOLD", category: "Innovation", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "SEIZE THE DAY", category: "Latin", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
  { text: "FORTUNE FAVORS BOLD", category: "Latin", difficulty: Difficulty.MEDIUM, tier: WordTier.PHRASES },
];

const HARD_PHRASES: Phrase[] = [
  { text: "BETTER LATE THAN NEVER BUT NEVER LATE IS BETTER", category: "Advice", difficulty: Difficulty.HARD, tier: WordTier.BLOCK_TEXT },
  { text: "TO BE OR NOT TO BE THAT IS THE QUESTION", category: "Literature", difficulty: Difficulty.HARD, tier: WordTier.BLOCK_TEXT },
  { text: "EVERY CLOUD HAS A SILVER LINING SOMEWHERE", category: "Hope", difficulty: Difficulty.HARD, tier: WordTier.BLOCK_TEXT },
  { text: "THE ONLY THING WE HAVE TO FEAR IS FEAR ITSELF", category: "History", difficulty: Difficulty.HARD, tier: WordTier.BLOCK_TEXT },
  { text: "ALL THAT GLITTERS IS NOT GOLD MY FRIEND", category: "Literature", difficulty: Difficulty.HARD, tier: WordTier.BLOCK_TEXT },
  { text: "THE CRUSHING WEIGHT OF SILENCE IS LOUD", category: "Thematic", difficulty: Difficulty.HARD, tier: WordTier.BLOCK_TEXT },
  { text: "THOSE WHO CANNOT REMEMBER THE PAST ARE CONDEMNED", category: "Philosophy", difficulty: Difficulty.HARD, tier: WordTier.BLOCK_TEXT },
  { text: "IN THE MIDDLE OF DIFFICULTY LIES OPPORTUNITY", category: "Einstein", difficulty: Difficulty.HARD, tier: WordTier.BLOCK_TEXT },
  { text: "THE JOURNEY OF A THOUSAND MILES BEGINS WITH ONE STEP", category: "Wisdom", difficulty: Difficulty.HARD, tier: WordTier.BLOCK_TEXT },
  { text: "NOT ALL THOSE WHO WANDER ARE LOST IN THE DARK", category: "Literature", difficulty: Difficulty.HARD, tier: WordTier.BLOCK_TEXT },
];

// Convert easy words to Phrase objects
const EASY_PHRASES: Phrase[] = EASY_WORDS.map(word => ({
  text: word,
  category: "Words",
  difficulty: Difficulty.EASY,
  tier: WordTier.SINGLE_WORDS,
}));

// Combined phrase list
const ALL_PHRASES: Phrase[] = [
  ...EASY_PHRASES,
  ...MEDIUM_PHRASES,
  ...HARD_PHRASES,
];

// =============================================================================
// PHRASE SELECTION
// =============================================================================

/**
 * Get a random phrase matching the given difficulty
 */
export function getRandomPhrase(difficulty: Difficulty): Phrase {
  const filtered = ALL_PHRASES.filter(p => p.difficulty === difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Get a phrase by tier (for progression system)
 */
export function getPhraseByTier(tier: WordTier): Phrase {
  const filtered = ALL_PHRASES.filter(p => p.tier === tier);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// =============================================================================
// LETTER SCRAMBLING
// =============================================================================

/**
 * Create a scattered grid of letters for the visual pool
 * Uses a grid system to prevent overlap while maintaining randomness
 */
export function scrambleLetters(text: string): LetterEntity[] {
  const chars = text.replace(/\s/g, '').split('');
  
  // Create grid cells
  const cols = LETTER_POOL.GRID_COLS;
  const rows = LETTER_POOL.GRID_ROWS;
  const gridCells: { r: number; c: number }[] = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      gridCells.push({ r, c });
    }
  }
  
  // Shuffle grid cells (Fisher-Yates)
  for (let i = gridCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gridCells[i], gridCells[j]] = [gridCells[j], gridCells[i]];
  }
  
  const paddingX = LETTER_POOL.PADDING_X_PERCENT;
  const paddingY = LETTER_POOL.PADDING_Y_PERCENT;
  const cellWidth = (100 - paddingX * 2) / cols;
  const cellHeight = (100 - paddingY * 2) / rows;
  
  return chars.map((char, i): LetterEntity => {
    // Assign each character to a cell (wrap if more chars than cells)
    const cell = gridCells[i % gridCells.length];
    
    // Random position within cell
    const offsetX = (Math.random() * 0.5 + 0.25) * cellWidth;
    const offsetY = (Math.random() * 0.5 + 0.25) * cellHeight;
    
    return {
      id: `${char}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      char: char.toUpperCase(),
      x: paddingX + (cell.c * cellWidth) + offsetX,
      y: paddingY + (cell.r * cellHeight) + offsetY,
      rotation: (Math.random() * 2 - 1) * LETTER_POOL.MAX_ROTATION,
      colorIndex: Math.floor(Math.random() * 4),
      isUsed: false,
    };
  });
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Check if a character requires player input (alphanumeric)
 */
export function requiresInput(char: string): boolean {
  return /^[A-Z0-9]$/i.test(char);
}

/**
 * Check if a character should be auto-completed (space, punctuation)
 */
export function isAutoComplete(char: string): boolean {
  return /^[\s.,!?;:'"()\-]$/.test(char);
}
