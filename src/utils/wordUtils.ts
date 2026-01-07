/**
 * WORD UTILITIES
 * Phrase data loading, word selection, and letter scrambling.
 */

import { Difficulty, LetterEntity, Phrase, WordEntry, WordDataFile, WordTier } from '../types';
import { LETTER_POOL } from '../constants';
import wordData1 from '../data/words/words.json';
import wordData2 from '../data/words/words2.json';

// =============================================================================
// PHRASE DATA LOADING
// =============================================================================

/**
 * Convert a WordEntry from JSON to a Phrase object
 */
function wordEntryToPhrase(entry: WordEntry): Phrase {
  const difficultyMap: Record<string, Difficulty> = {
    'EASY': Difficulty.EASY,
    'MEDIUM': Difficulty.MEDIUM,
    'HARD': Difficulty.HARD,
    'EXPERT': Difficulty.EXPERT,
  };

  // Determine tier based on text characteristics
  const letterCount = entry.text.replace(/[^A-Z]/gi, '').length;
  const wordCount = entry.text.split(' ').length;

  let tier: WordTier;
  if (letterCount <= 4) {
    tier = WordTier.COMMAND;
  } else if (letterCount <= 7 && wordCount === 1) {
    tier = WordTier.SINGLE_WORDS;
  } else if (wordCount <= 3) {
    tier = WordTier.PHRASES;
  } else {
    tier = WordTier.BLOCK_TEXT;
  }

  // Handle both single tag (legacy) and tags array (new format)
  // Pick first tag from array, or use single tag
  const primaryTag = entry.tags?.[0] || entry.tag;

  return {
    text: entry.text.toUpperCase(),
    category: entry.theme,
    difficulty: difficultyMap[entry.difficulty] || Difficulty.EASY,
    tier,
    tag: primaryTag,
    hints: entry.hints,
  };
}

// Load and merge all word files
const allWordData: WordEntry[] = [
  ...(wordData1 as WordDataFile).words,
  ...(wordData2 as WordDataFile).words,
];

// Convert to phrases and dedupe by text
const phraseMap = new Map<string, Phrase>();
allWordData.forEach(entry => {
  const phrase = wordEntryToPhrase(entry);
  // Later entries override earlier ones (words2 takes priority)
  phraseMap.set(phrase.text, phrase);
});

const ALL_PHRASES: Phrase[] = Array.from(phraseMap.values());

// =============================================================================
// PHRASE SELECTION
// =============================================================================

/**
 * Get a random phrase matching the given difficulty
 */
export function getRandomPhrase(difficulty: Difficulty): Phrase {
  const filtered = ALL_PHRASES.filter(p => p.difficulty === difficulty);

  // Fallback to any phrase if no matches (shouldn't happen with good data)
  if (filtered.length === 0) {
    console.warn(`No phrases found for difficulty: ${difficulty}, using random`);
    return ALL_PHRASES[Math.floor(Math.random() * ALL_PHRASES.length)];
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Get a phrase by tier (for progression system)
 */
export function getPhraseByTier(tier: WordTier): Phrase {
  const filtered = ALL_PHRASES.filter(p => p.tier === tier);

  if (filtered.length === 0) {
    console.warn(`No phrases found for tier: ${tier}, using random`);
    return ALL_PHRASES[Math.floor(Math.random() * ALL_PHRASES.length)];
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Get all phrases (for debugging/stats)
 */
export function getAllPhrases(): Phrase[] {
  return [...ALL_PHRASES];
}

/**
 * Get phrase counts by difficulty (for debugging)
 */
export function getPhraseCounts(): Record<string, number> {
  return {
    EASY: ALL_PHRASES.filter(p => p.difficulty === Difficulty.EASY).length,
    MEDIUM: ALL_PHRASES.filter(p => p.difficulty === Difficulty.MEDIUM).length,
    HARD: ALL_PHRASES.filter(p => p.difficulty === Difficulty.HARD).length,
    EXPERT: ALL_PHRASES.filter(p => p.difficulty === Difficulty.EXPERT).length,
    TOTAL: ALL_PHRASES.length,
  };
}

// =============================================================================
// LETTER SCRAMBLING
// =============================================================================

/**
 * Create a scattered grid of letters for the visual pool
 * Uses absolute pixel positions within the game area
 */
export function scrambleLetters(text: string): LetterEntity[] {
  const chars = text.replace(/\s/g, '').split('');

  // Grid settings (hardcoded since this is legacy utility)
  const cols = 10;
  const rows = 5;
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

  // Use the spawn area from LETTER_POOL (now in pixels)
  const spawnWidth = LETTER_POOL.SPAWN_X_MAX - LETTER_POOL.SPAWN_X_MIN;
  const spawnHeight = LETTER_POOL.SPAWN_Y_MAX - LETTER_POOL.SPAWN_Y_MIN;
  const cellWidth = spawnWidth / cols;
  const cellHeight = spawnHeight / rows;

  return chars.map((char, i): LetterEntity => {
    // Assign each character to a cell (wrap if more chars than cells)
    const cell = gridCells[i % gridCells.length];

    // Random position within cell
    const offsetX = (Math.random() * 0.5 + 0.25) * cellWidth;
    const offsetY = (Math.random() * 0.5 + 0.25) * cellHeight;

    return {
      id: `${char}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      char: char.toUpperCase(),
      x: LETTER_POOL.SPAWN_X_MIN + (cell.c * cellWidth) + offsetX,
      y: LETTER_POOL.SPAWN_Y_MIN + (cell.r * cellHeight) + offsetY,
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
