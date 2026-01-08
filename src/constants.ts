/**
 * GAME CONSTANTS
 * All tunable values live here. Adjust these to change game feel.
 * Organized by system for easy navigation.
 */

// =============================================================================
// DISPLAY
// =============================================================================
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const BACKGROUND_COLOR = 0x010201;

// =============================================================================
// LAYOUT ZONES (pixels)
// =============================================================================
export const LAYOUT = {
  // Staging area at top (where wrong letters animate before falling)
  STAGING_AREA_HEIGHT: 60,
  STAGING_AREA_Y: 30, // Center Y of staging area

  // Left sidebar
  SIDEBAR_WIDTH: 160,
  SIDEBAR_X: 80, // Center X of sidebar

  // Main game area (center)
  GAME_AREA_X: 160, // Left edge of game area
  GAME_AREA_WIDTH: 960, // 1280 - 160 (sidebar) - 160 (right margin)
  GAME_AREA_CENTER_X: 160 + 480, // 640 - center of game area
  GAME_AREA_TOP: 80, // Top of play zone (below staging)
  GAME_AREA_BOTTOM: 560, // Bottom of play zone (fail zone)

  // Fail zone (game over line)
  FAIL_ZONE_Y: 560,
  FAIL_ZONE_HEIGHT: 40,

  // Blank display + theme at bottom
  BLANK_DISPLAY_Y: 640,
  THEME_LABEL_Y: 600,
} as const;

// =============================================================================
// COLORS (hex for Phaser, CSS strings where needed)
// =============================================================================
export const COLORS = {
  // Primary palette
  TERMINAL_GREEN: 0x00ff41,
  TERMINAL_GREEN_CSS: '#00ff41',
  
  // Accent greens
  GREEN_LIGHT: 0x77ffaa,
  GREEN_MEDIUM: 0x00ee66,
  GREEN_PALE: 0xaaffcc,
  
  // Error/danger
  ERROR_RED: 0xff0000,
  ERROR_RED_CSS: '#ff0000',
  WARNING_ORANGE: 0xff8800,
  WARNING_ORANGE_CSS: '#ff8800',
  
  // Highlights
  RADIOACTIVE: 0xccff00,
  OVERDRIVE_WHITE: 0xffffff,
  
  // Industrial palette (for future machine states)
  RUST: 0x8b4513,
  OXIDE_GREEN: 0x4a5d23,
  SOOT: 0x2b2b2b,
  BRASS: 0xb5a642,
  MAHOGANY: 0x420d09,
  
  // UI
  UI_BORDER: 0x00ff41,
  UI_BACKGROUND: 0x000000,
  UI_DIM: 0x333333,
} as const;

// =============================================================================
// CRUSHER PHYSICS (percentage-based for screen-size independence)
// =============================================================================
// All movement values are percentages of "runway" (distance from start to fail zone)
// This ensures consistent feel across different screen sizes
export const CRUSHER = {
  // Position (relative to LAYOUT.GAME_AREA_TOP)
  INITIAL_Y: 100, // Starting Y position (below staging area)

  // ==========================================================================
  // GRADUATED AWAKENING ("Loosening Up")
  // Heavy thing needs multiple shoves to get moving
  // ==========================================================================
  AWAKENING: {
    // Instant drop on each mistake (same for all phases) - % of runway
    SHOVE_DROP_PERCENT: 2.5,        // The "pop" - immediate jolt down

    // Slide amounts after the shove - % of runway
    STIRRING_SLIDE_PERCENT: 1.25,   // 1st mistake: small slide, then stops
    LOOSENING_SLIDE_PERCENT: 2.5,   // 2nd mistake: longer slide, then stops
    // 3rd mistake: continuous descent begins (no slide limit)

    // Slide speed (how fast the slide happens) - % of runway per second
    SLIDE_SPEED_PERCENT: 3,         // Slow, dread-inducing slide
  },

  // ==========================================================================
  // DESCENT (after fully awakened - 3rd+ mistake)
  // Adaptive: starts as slow dread, accelerates with each weight
  // ==========================================================================
  // Base descent speeds calibrated to typing ability (% of runway per second)
  // SOFTENED: Original values were too punishing. Now gentler progression.
  BASE_DESCENT_PERCENT: {
    EASY: 4,      // ~25 sec - comfortable for beginners (40 WPM players)
    MEDIUM: 4.5,  // ~22 sec - slightly faster, still forgiving
    HARD: 5.5,    // ~18 sec - noticeable pressure but survivable
    EXPERT: 8,    // ~12 sec - real challenge for skilled typists
  },

  // Acceleration per penalty weight on crusher (compounds the dread)
  // SOFTENED: Gentler snowball effect
  WEIGHT_ACCELERATION_PERCENT: {
    EASY: 5,      // Each weight adds 5% to descent speed
    MEDIUM: 7,    // Each weight adds 7% (was 10%)
    HARD: 10,     // Each weight adds 10% (was 15%)
    EXPERT: 15,   // Each weight adds 15% (was 20%)
  },

  // Stage multiplier (future: campaign progression)
  STAGE_SPEED_MULTIPLIER: 0.05,   // Additional speed per stage

  // ==========================================================================
  // LIFT (reward for correct input)
  // Linear and tame - the combo audio escalation sells the "click" moment
  // SOFTENED: More generous lift across difficulties
  // ==========================================================================
  LIFT_PERCENT: {
    EASY: 6.5,    // Generous lift - breathing room
    MEDIUM: 5.5,  // Still generous (was 4.3)
    HARD: 4.5,    // Moderate lift (was 3.25)
    EXPERT: 3.5,  // Tighter but survivable (was 2.2)
  },

  LIFT_COMBO_BONUS_PERCENT: 0.2,   // Small bonus per combo level (tame, linear)
  LIFT_WORD_COMPLETE_PERCENT: 10,  // Percentage of runway restored on word complete
  LIFT_KINETIC_PULSE_PERCENT: 25,  // Kinetic battery pulse (overdrive reward)

  // Pause on correct input - moment of relief
  PAUSE_DURATION_MS: 200,

  // ==========================================================================
  // AWAKENING THRESHOLD (mistakes before continuous descent)
  // ==========================================================================
  AWAKENING_THRESHOLD: {
    EASY: 4,      // 4 mistakes before crusher starts moving continuously
    MEDIUM: 3,    // 3 mistakes (default feel)
    HARD: 2,      // 2 mistakes - very little grace period
    EXPERT: 1,    // 1 mistake - first mistake = immediate motion
  },

  // Visual
  WIDTH: 800,                     // Fits within GAME_AREA_WIDTH (960)
  HEIGHT: 40,
} as const;

// =============================================================================
// COMBO / STREAK SYSTEM
// =============================================================================
export const COMBO = {
  OVERDRIVE_THRESHOLD: 20,        // Streak needed for overdrive (was 6 in prototype, 20 in design doc)
  OVERDRIVE_DURATION_MS: 3000,    // How long overdrive lasts
  KINETIC_BATTERY_THRESHOLD: 20,  // Streak needed for kinetic pulse
  
  // Audio escalation
  PITCH_RESET_THRESHOLD: 12,      // Reset pitch after this many correct
} as const;

// =============================================================================
// DIFFICULTY SETTINGS
// =============================================================================
// All difficulty-specific values are now in CRUSHER object for clarity:
// - CRUSHER.BASE_DESCENT_PERCENT[difficulty]
// - CRUSHER.WEIGHT_ACCELERATION_PERCENT[difficulty]
// - CRUSHER.LIFT_PERCENT[difficulty]
// - CRUSHER.AWAKENING_THRESHOLD[difficulty]
//
// This section reserved for future difficulty-related settings that don't
// fit in the CRUSHER object (e.g., word selection, scoring multipliers)

// =============================================================================
// INPUT
// =============================================================================
export const INPUT = {
  // Characters that require player input
  VALID_CHARS: /^[A-Z0-9]$/,
  
  // Characters that auto-complete
  AUTO_COMPLETE_CHARS: /^[\s.,!?;:'"()\-]$/,
} as const;

// =============================================================================
// SCORING
// =============================================================================
export const SCORING = {
  BASE_POINTS_PER_CHAR: 10,
  ACCURACY_MULTIPLIER: 1.5,
  COMBO_MULTIPLIER: 0.1,          // Per combo level
  TIME_BONUS_THRESHOLD_SEC: 30,   // Bonus if completed under this time
  TIME_BONUS_AMOUNT: 500,
} as const;

// =============================================================================
// PARTICLES / VFX
// =============================================================================
export const PARTICLES = {
  CORRECT_COUNT: 12,
  ERROR_COUNT: 20,
  LIFETIME_MS: 700,
  MAX_PARTICLES: 100,             // Pool limit for performance
} as const;

// =============================================================================
// AUDIO (placeholder values - will be replaced with actual audio system)
// =============================================================================
export const AUDIO = {
  BASE_PITCH: 1.0,
  PITCH_INCREMENT: 0.05,          // Semitone-ish increase per correct
  MAX_PITCH: 2.0,
  
  // Volume levels
  MASTER_VOLUME: 0.8,
  SFX_VOLUME: 1.0,
  MUSIC_VOLUME: 0.6,
} as const;

// =============================================================================
// TIMING
// =============================================================================
export const TIMING = {
  SCREEN_SHAKE_DURATION_MS: 150,
  ERROR_FLASH_DURATION_MS: 500,
  PANIC_THRESHOLD_PERCENT: 75,    // Crusher position to trigger panic state
} as const;

// =============================================================================
// PHYSICS (Matter.js - coin-pusher implementation)
// =============================================================================
export const PHYSICS = {
  GRAVITY_Y: 0, // No global gravity - letters stay in place until pushed
  LETTER_MASS: 1,
  PENALTY_LETTER_MASS: 3,         // 3x mass from design doc
  RESTITUTION: 0.2,               // Bounciness (low to prevent chaos)
  FRICTION: 0.3,                  // Surface friction
  FRICTION_STATIC: 0.5,           // Static friction (prevents sliding)
  FRICTION_AIR: 0.02,             // Air resistance (slows things down)
  ANGULAR_DAMPING: 0.95,          // Reduces rotation quickly for readability

  // Letter block dimensions
  LETTER_BLOCK_SIZE: 64,

  // Play area boundaries (now uses LAYOUT values)
  FLOOR_Y: 560,                   // Matches LAYOUT.FAIL_ZONE_Y
  WALL_THICKNESS: 20,

  // Crusher
  CRUSHER_PUSH_FORCE: 0.002,      // Force applied when crusher contacts letters

  // Penalty letter gravity (falls onto crusher)
  PENALTY_GRAVITY: 0.003,         // Stronger so they fall faster
} as const;

// =============================================================================
// LETTER POOL (physics-based scattered letters)
// =============================================================================
export const LETTER_POOL = {
  // Initial spawn area - centered, slightly narrower than crusher (800px)
  // ~750px span centered at 640px
  SPAWN_X_MIN: 265,               // 640 - 375 (centered)
  SPAWN_X_MAX: 1015,              // 640 + 375 (centered)
  SPAWN_Y_MIN: 180,               // Below crusher starting position
  SPAWN_Y_MAX: 500,               // Above fail zone

  // Scatter settings
  MIN_SPACING: 50,                // Minimum pixels between letter centers

  // Readability
  MAX_ROTATION: 15,               // ±degrees (readability guard from design doc)
  FONT_SIZE: 40,
} as const;

// =============================================================================
// BLANK DISPLAY (word reveal at bottom)
// =============================================================================
export const BLANK_DISPLAY = {
  CHAR_WIDTH: 44,                 // Box width (was 36)
  CHAR_HEIGHT: 52,                // Box height (was 44)
  FONT_SIZE: 36,                  // Character font size (was 28)
  WORD_GAP: 28,                   // Space between words (was 24)
  THEME_FONT_SIZE: 22,            // Theme label font size (was 18)
  MAX_WIDTH: 900,                 // Max width before scaling down
} as const;
