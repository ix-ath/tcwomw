/**
 * SettingsManager - Handles persistence of user settings to LocalStorage.
 *
 * Manages:
 * - Visual settings (colorblind mode, font scale, screen shake)
 * - Audio settings (volume levels, mute)
 * - Control settings (mouse-only mode, key bindings)
 * - Gameplay settings (debug assists)
 *
 * Separate from SaveManager to allow settings to persist across save resets.
 */

import type {
  Settings,
  VisualSettings,
  AudioSettings,
  ControlSettings,
  GameplaySettings,
  ColorblindMode,
  FontScale,
  KeyBindings,
} from '../types';

const SETTINGS_KEY = 'tcwomw_settings';
const CURRENT_VERSION = '1.0.0';

interface StoredSettings {
  version: string;
  settings: Settings;
}

/**
 * Creates default settings for new players.
 */
function createDefaultSettings(): Settings {
  return {
    visual: {
      colorblindMode: 'none',
      fontScale: 'medium',
      screenShakeEnabled: true,
    },
    audio: {
      musicVolume: 60,
      sfxVolume: 100,
      uiVolume: 80,
      muteAll: false,
    },
    controls: {
      mouseOnlyMode: false,
      keyBindings: {
        pause: 'ESCAPE',
        restart: 'R',
        mute: 'M',
      },
    },
    gameplay: {
      showLetterOrder: false,
    },
  };
}

/**
 * Migrates old settings to current version.
 */
function migrateSettings(stored: StoredSettings): StoredSettings {
  // Future migrations go here
  stored.version = CURRENT_VERSION;
  return stored;
}

/**
 * SettingsManager singleton for managing user preferences.
 */
class SettingsManagerClass {
  private settings: Settings;
  private listeners: Map<string, Set<(value: unknown) => void>> = new Map();

  constructor() {
    this.settings = this.load();
  }

  /**
   * Load settings from LocalStorage.
   */
  private load(): Settings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        console.log('[SettingsManager] No settings found, using defaults');
        return createDefaultSettings();
      }

      const stored = JSON.parse(raw) as StoredSettings;

      // Migrate if needed
      if (stored.version !== CURRENT_VERSION) {
        console.log(`[SettingsManager] Migrating settings from ${stored.version} to ${CURRENT_VERSION}`);
        const migrated = migrateSettings(stored);
        return migrated.settings;
      }

      // Merge with defaults to handle any missing keys from updates
      const defaults = createDefaultSettings();
      const merged = this.deepMerge(defaults, stored.settings);

      console.log('[SettingsManager] Settings loaded successfully');
      return merged;
    } catch (error) {
      console.error('[SettingsManager] Failed to load settings, using defaults:', error);
      return createDefaultSettings();
    }
  }

  /**
   * Deep merge two objects, with source taking priority.
   */
  private deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceVal = source[key];
        const targetVal = target[key];
        if (sourceVal && typeof sourceVal === 'object' && !Array.isArray(sourceVal) &&
            targetVal && typeof targetVal === 'object' && !Array.isArray(targetVal)) {
          (result as Record<string, unknown>)[key] = this.deepMerge(
            targetVal as object,
            sourceVal as object
          );
        } else if (sourceVal !== undefined) {
          (result as Record<string, unknown>)[key] = sourceVal;
        }
      }
    }
    return result;
  }

  /**
   * Save settings to LocalStorage.
   */
  save(): void {
    try {
      const stored: StoredSettings = {
        version: CURRENT_VERSION,
        settings: this.settings,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(stored));
      console.log('[SettingsManager] Settings saved');
    } catch (error) {
      console.error('[SettingsManager] Failed to save settings:', error);
    }
  }

  // ===========================================================================
  // GETTERS - Full categories
  // ===========================================================================

  getAll(): Settings {
    return JSON.parse(JSON.stringify(this.settings));
  }

  getVisual(): VisualSettings {
    return { ...this.settings.visual };
  }

  getAudio(): AudioSettings {
    return { ...this.settings.audio };
  }

  getControls(): ControlSettings {
    return { ...this.settings.controls };
  }

  getGameplay(): GameplaySettings {
    return { ...this.settings.gameplay };
  }

  // ===========================================================================
  // GETTERS - Individual settings (for convenience)
  // ===========================================================================

  getColorblindMode(): ColorblindMode {
    return this.settings.visual.colorblindMode;
  }

  getFontScale(): FontScale {
    return this.settings.visual.fontScale;
  }

  isScreenShakeEnabled(): boolean {
    return this.settings.visual.screenShakeEnabled;
  }

  getMusicVolume(): number {
    return this.settings.audio.muteAll ? 0 : this.settings.audio.musicVolume;
  }

  getSfxVolume(): number {
    return this.settings.audio.muteAll ? 0 : this.settings.audio.sfxVolume;
  }

  getUiVolume(): number {
    return this.settings.audio.muteAll ? 0 : this.settings.audio.uiVolume;
  }

  isMuted(): boolean {
    return this.settings.audio.muteAll;
  }

  isMouseOnlyMode(): boolean {
    return this.settings.controls.mouseOnlyMode;
  }

  getKeyBindings(): KeyBindings {
    return { ...this.settings.controls.keyBindings };
  }

  isShowLetterOrder(): boolean {
    return this.settings.gameplay.showLetterOrder;
  }

  // ===========================================================================
  // SETTERS - Visual
  // ===========================================================================

  setColorblindMode(mode: ColorblindMode): void {
    this.settings.visual.colorblindMode = mode;
    this.save();
    this.notify('colorblindMode', mode);
  }

  setFontScale(scale: FontScale): void {
    this.settings.visual.fontScale = scale;
    this.save();
    this.notify('fontScale', scale);
  }

  setScreenShake(enabled: boolean): void {
    this.settings.visual.screenShakeEnabled = enabled;
    this.save();
    this.notify('screenShake', enabled);
  }

  // ===========================================================================
  // SETTERS - Audio
  // ===========================================================================

  setMusicVolume(volume: number): void {
    this.settings.audio.musicVolume = Math.max(0, Math.min(100, volume));
    this.save();
    this.notify('musicVolume', this.settings.audio.musicVolume);
  }

  setSfxVolume(volume: number): void {
    this.settings.audio.sfxVolume = Math.max(0, Math.min(100, volume));
    this.save();
    this.notify('sfxVolume', this.settings.audio.sfxVolume);
  }

  setUiVolume(volume: number): void {
    this.settings.audio.uiVolume = Math.max(0, Math.min(100, volume));
    this.save();
    this.notify('uiVolume', this.settings.audio.uiVolume);
  }

  setMuteAll(muted: boolean): void {
    this.settings.audio.muteAll = muted;
    this.save();
    this.notify('muteAll', muted);
  }

  // ===========================================================================
  // SETTERS - Controls
  // ===========================================================================

  setMouseOnlyMode(enabled: boolean): void {
    this.settings.controls.mouseOnlyMode = enabled;
    this.save();
    this.notify('mouseOnlyMode', enabled);
  }

  setKeyBinding(action: keyof KeyBindings, key: string): void {
    this.settings.controls.keyBindings[action] = key;
    this.save();
    this.notify('keyBindings', this.settings.controls.keyBindings);
  }

  // ===========================================================================
  // SETTERS - Gameplay
  // ===========================================================================

  setShowLetterOrder(enabled: boolean): void {
    this.settings.gameplay.showLetterOrder = enabled;
    this.save();
    this.notify('showLetterOrder', enabled);
  }

  // ===========================================================================
  // EVENT SYSTEM (for reactive updates)
  // ===========================================================================

  /**
   * Subscribe to setting changes.
   * Returns an unsubscribe function.
   */
  onChange(key: string, callback: (value: unknown) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  private notify(key: string, value: unknown): void {
    this.listeners.get(key)?.forEach(callback => callback(value));
  }

  // ===========================================================================
  // UTILITY
  // ===========================================================================

  /**
   * Reset all settings to defaults.
   */
  resetToDefaults(): void {
    console.log('[SettingsManager] Resetting to defaults');
    this.settings = createDefaultSettings();
    this.save();
    // Notify all listeners
    this.notify('colorblindMode', this.settings.visual.colorblindMode);
    this.notify('fontScale', this.settings.visual.fontScale);
    this.notify('screenShake', this.settings.visual.screenShakeEnabled);
    this.notify('musicVolume', this.settings.audio.musicVolume);
    this.notify('sfxVolume', this.settings.audio.sfxVolume);
    this.notify('uiVolume', this.settings.audio.uiVolume);
    this.notify('muteAll', this.settings.audio.muteAll);
    this.notify('mouseOnlyMode', this.settings.controls.mouseOnlyMode);
    this.notify('keyBindings', this.settings.controls.keyBindings);
    this.notify('showLetterOrder', this.settings.gameplay.showLetterOrder);
  }

  /**
   * Get font size multiplier based on font scale setting.
   */
  getFontSizeMultiplier(): number {
    switch (this.settings.visual.fontScale) {
      case 'small': return 0.85;
      case 'medium': return 1.0;
      case 'large': return 1.2;
      default: return 1.0;
    }
  }
}

// Export singleton instance
export const SettingsManager = new SettingsManagerClass();

// Also export class for testing
export { SettingsManagerClass };
