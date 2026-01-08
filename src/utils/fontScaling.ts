/**
 * Font Scaling Utility
 *
 * Provides scaled font sizes for UI elements based on user settings.
 * Only affects menu/UI text, NOT game board letters.
 */

import { SettingsManager } from '@systems/SettingsManager';

/** Base font sizes used throughout the UI */
export const BASE_FONT_SIZES = {
  // Titles
  TITLE_LARGE: 72,
  TITLE_MEDIUM: 48,
  TITLE_SMALL: 32,

  // Body/UI text
  BODY_LARGE: 28,
  BODY_MEDIUM: 24,
  BODY_SMALL: 20,

  // Labels/hints
  LABEL: 22,
  HINT: 18,
  FOOTER: 16,

  // Buttons
  BUTTON_LARGE: 32,
  BUTTON_MEDIUM: 28,
  BUTTON_SMALL: 24,
} as const;

export type FontSizeKey = keyof typeof BASE_FONT_SIZES;

/**
 * Get a scaled font size based on current settings.
 * @param baseSize - The base font size (or key from BASE_FONT_SIZES)
 * @returns The scaled font size as a number
 */
export function getScaledFontSize(baseSize: number | FontSizeKey): number {
  const size = typeof baseSize === 'string' ? BASE_FONT_SIZES[baseSize] : baseSize;
  const multiplier = SettingsManager.getFontSizeMultiplier();
  return Math.round(size * multiplier);
}

/**
 * Get a scaled font size as a CSS-style string (e.g., "24px").
 * @param baseSize - The base font size (or key from BASE_FONT_SIZES)
 * @returns The scaled font size as a string with "px" suffix
 */
export function getScaledFontSizeStr(baseSize: number | FontSizeKey): string {
  return `${getScaledFontSize(baseSize)}px`;
}

/**
 * Create a Phaser text style object with scaled font size.
 * @param baseSize - The base font size (or key from BASE_FONT_SIZES)
 * @param color - Text color (default: terminal green)
 * @returns Phaser text style configuration
 */
export function createScaledTextStyle(
  baseSize: number | FontSizeKey,
  color: string = '#00ff41'
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'VT323, monospace',
    fontSize: getScaledFontSizeStr(baseSize),
    color,
  };
}

/**
 * Update an existing Phaser text object with scaled font size.
 * Call this when font scale setting changes.
 * @param text - The Phaser text object to update
 * @param baseSize - The base font size to scale from
 */
export function updateTextScale(
  text: Phaser.GameObjects.Text,
  baseSize: number | FontSizeKey
): void {
  text.setFontSize(getScaledFontSize(baseSize));
}
