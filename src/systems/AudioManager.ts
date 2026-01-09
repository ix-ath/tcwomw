/**
 * AudioManager - Centralized audio system with procedural fallbacks.
 *
 * Features:
 * - Loads sounds from audio-manifest.json
 * - Procedural fallback sounds (no assets needed to start)
 * - Respects SettingsManager volume levels
 * - Event-driven (can listen to GameEvents)
 * - Easy asset swapping (just update manifest paths)
 *
 * Usage:
 *   AudioManager.init(scene);  // Call once from PreloadScene
 *   AudioManager.play('correct_letter', { pitch: 1.2 });
 *   AudioManager.playMusic('ambient_factory');
 */

import { SettingsManager } from './SettingsManager';
import audioManifestRaw from '../data/audio-manifest.json';

type SoundCategory = 'sfx' | 'ui' | 'music';

// Type-safe manifest access
interface AudioManifest {
  sfx: Record<string, SoundConfig>;
  ui: Record<string, SoundConfig>;
  music: Record<string, SoundConfig>;
  combo: {
    pitch_increment: number;
    max_pitch: number;
    reset_after: number;
  };
}

const audioManifest = audioManifestRaw as unknown as AudioManifest;

interface SoundConfig {
  path: string | null;
  fallback: string | null;
  category: SoundCategory;
  loop?: boolean;
  pitchVariance?: number;
  notes?: string;
}

interface PlayOptions {
  pitch?: number;
  volume?: number;
  loop?: boolean;
}

class AudioManagerClass {
  private audioContext: AudioContext | null = null;
  private initialized: boolean = false;
  private loadedSounds: Map<string, AudioBuffer> = new Map();
  private currentMusic: { source: AudioBufferSourceNode; gainNode: GainNode } | null = null;
  private currentMusicKey: string | null = null;

  // Combo pitch tracking
  private comboPitch: number = 1.0;
  private comboCount: number = 0;

  /**
   * Initialize the audio system. Call once from PreloadScene.
   */
  init(): void {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
      console.log('[AudioManager] Initialized with Web Audio API');

      // Resume audio context on user interaction (browser autoplay policy)
      const resumeAudio = () => {
        if (this.audioContext?.state === 'suspended') {
          this.audioContext.resume();
        }
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('keydown', resumeAudio);
      };
      document.addEventListener('click', resumeAudio);
      document.addEventListener('keydown', resumeAudio);

      // Listen for settings changes
      SettingsManager.onChange('muteAll', () => this.updateMusicVolume());
      SettingsManager.onChange('musicVolume', () => this.updateMusicVolume());
      SettingsManager.onChange('sfxVolume', () => {});
      SettingsManager.onChange('uiVolume', () => {});
    } catch (error) {
      console.error('[AudioManager] Failed to initialize:', error);
    }
  }

  /**
   * Play a sound effect by key.
   */
  play(key: string, options: PlayOptions = {}): void {
    if (!this.initialized || !this.audioContext) return;
    if (SettingsManager.isMuted()) return;

    // Find the sound in manifest
    const config = this.findSound(key);
    if (!config) {
      console.warn(`[AudioManager] Sound not found: ${key}`);
      return;
    }

    const volume = this.getVolumeForCategory(config.category) * (options.volume ?? 1);
    if (volume <= 0) return;

    const pitch = options.pitch ?? 1.0;

    // If we have a loaded sound, play it
    if (config.path && this.loadedSounds.has(key)) {
      this.playBuffer(this.loadedSounds.get(key)!, volume, pitch, options.loop ?? config.loop ?? false);
      return;
    }

    // Otherwise, use procedural fallback
    if (config.fallback) {
      this.playProcedural(config.fallback, volume, pitch);
    }
  }

  /**
   * Play a sound with combo pitch scaling.
   * Automatically increments pitch based on combo.
   */
  playCombo(key: string = 'correct_letter'): void {
    const comboConfig = audioManifest.combo;

    this.comboCount++;
    this.comboPitch = Math.min(
      1.0 + (this.comboCount * comboConfig.pitch_increment),
      comboConfig.max_pitch
    );

    // Reset pitch after threshold
    if (this.comboCount >= comboConfig.reset_after) {
      this.comboCount = 0;
      this.comboPitch = 1.0;
    }

    this.play(key, { pitch: this.comboPitch });
  }

  /**
   * Reset combo pitch tracking.
   */
  resetCombo(): void {
    this.comboCount = 0;
    this.comboPitch = 1.0;
  }

  /**
   * Play background music.
   */
  playMusic(key: string): void {
    if (!this.initialized || !this.audioContext) return;
    if (this.currentMusicKey === key) return; // Already playing

    // Stop current music
    this.stopMusic();

    const config = this.findSound(key, 'music');
    if (!config) {
      console.warn(`[AudioManager] Music not found: ${key}`);
      return;
    }

    // For now, music requires actual files (no procedural fallback)
    if (!config.path || !this.loadedSounds.has(key)) {
      console.log(`[AudioManager] Music '${key}' not loaded, skipping`);
      return;
    }

    const buffer = this.loadedSounds.get(key)!;
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = true;
    gainNode.gain.value = SettingsManager.getMusicVolume() / 100;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();

    this.currentMusic = { source, gainNode };
    this.currentMusicKey = key;
  }

  /**
   * Stop current music.
   */
  stopMusic(): void {
    if (this.currentMusic) {
      try {
        this.currentMusic.source.stop();
      } catch {
        // Already stopped
      }
      this.currentMusic = null;
      this.currentMusicKey = null;
    }
  }

  /**
   * Update music volume (called when settings change).
   */
  private updateMusicVolume(): void {
    if (this.currentMusic) {
      this.currentMusic.gainNode.gain.value = SettingsManager.getMusicVolume() / 100;
    }
  }

  // ===========================================================================
  // PROCEDURAL SOUND GENERATION
  // ===========================================================================

  private playProcedural(fallbackType: string, volume: number, pitch: number): void {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    switch (fallbackType) {
      case 'procedural:blip':
        this.genBlip(ctx, now, volume, pitch, 440);
        break;
      case 'procedural:blip_low':
        this.genBlip(ctx, now, volume, pitch, 220);
        break;
      case 'procedural:buzz':
        this.genBuzz(ctx, now, volume);
        break;
      case 'procedural:fanfare':
        this.genFanfare(ctx, now, volume, pitch);
        break;
      case 'procedural:thud':
        this.genThud(ctx, now, volume);
        break;
      case 'procedural:whoosh':
        this.genWhoosh(ctx, now, volume, pitch);
        break;
      case 'procedural:powerup':
        this.genPowerup(ctx, now, volume);
        break;
      case 'procedural:clunk':
        this.genClunk(ctx, now, volume);
        break;
      case 'procedural:crush':
        this.genCrush(ctx, now, volume);
        break;
      case 'procedural:victory':
        this.genVictory(ctx, now, volume);
        break;
      case 'procedural:tick':
        this.genTick(ctx, now, volume);
        break;
      case 'procedural:click':
        this.genClick(ctx, now, volume);
        break;
      case 'procedural:swoosh_down':
        this.genSwoosh(ctx, now, volume, -1);
        break;
      case 'procedural:coin':
        this.genCoin(ctx, now, volume);
        break;
      case 'procedural:unlock':
        this.genUnlock(ctx, now, volume);
        break;
      case 'procedural:deny':
        this.genDeny(ctx, now, volume);
        break;
      case 'procedural:tone_c4':
        this.genBlip(ctx, now, volume, pitch, 261.63);
        break;
      default:
        console.warn(`[AudioManager] Unknown procedural sound: ${fallbackType}`);
    }
  }

  // --- Procedural sound generators ---

  private genBlip(ctx: AudioContext, time: number, vol: number, pitch: number, baseFreq: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = baseFreq * pitch;
    gain.gain.setValueAtTime(vol * 0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private genBuzz(ctx: AudioContext, time: number, vol: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 80;
    gain.gain.setValueAtTime(vol * 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  private genFanfare(ctx: AudioContext, time: number, vol: number, pitch: number): void {
    [0, 0.1, 0.2].forEach((delay, i) => {
      const freq = [523, 659, 784][i] * pitch; // C5, E5, G5
      this.genBlip(ctx, time + delay, vol, 1, freq);
    });
  }

  private genThud(ctx: AudioContext, time: number, vol: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
    gain.gain.setValueAtTime(vol * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private genWhoosh(ctx: AudioContext, time: number, vol: number, pitch: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200 * pitch, time);
    osc.frequency.exponentialRampToValueAtTime(800 * pitch, time + 0.1);
    gain.gain.setValueAtTime(vol * 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  private genPowerup(ctx: AudioContext, time: number, vol: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(1200, time + 0.3);
    gain.gain.setValueAtTime(vol * 0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.4);
  }

  private genClunk(ctx: AudioContext, time: number, vol: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.05);
    gain.gain.setValueAtTime(vol * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private genCrush(ctx: AudioContext, time: number, vol: number): void {
    // Low rumble + noise
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, time);
    osc.frequency.exponentialRampToValueAtTime(20, time + 0.5);
    gain.gain.setValueAtTime(vol * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.6);
  }

  private genVictory(ctx: AudioContext, time: number, vol: number): void {
    [0, 0.15, 0.3, 0.45].forEach((delay, i) => {
      const freq = [523, 659, 784, 1047][i]; // C5, E5, G5, C6
      this.genBlip(ctx, time + delay, vol * 0.8, 1, freq);
    });
  }

  private genTick(ctx: AudioContext, time: number, vol: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(vol * 0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.02);
  }

  private genClick(ctx: AudioContext, time: number, vol: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(vol * 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.03);
  }

  private genSwoosh(ctx: AudioContext, time: number, vol: number, direction: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const startFreq = direction > 0 ? 300 : 600;
    const endFreq = direction > 0 ? 600 : 300;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.1);
    gain.gain.setValueAtTime(vol * 0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  private genCoin(ctx: AudioContext, time: number, vol: number): void {
    [0, 0.05].forEach((delay, i) => {
      const freq = [1200, 1600][i];
      this.genBlip(ctx, time + delay, vol * 0.6, 1, freq);
    });
  }

  private genUnlock(ctx: AudioContext, time: number, vol: number): void {
    [0, 0.1, 0.2].forEach((delay, i) => {
      const freq = [400, 500, 800][i];
      this.genBlip(ctx, time + delay, vol * 0.7, 1, freq);
    });
  }

  private genDeny(ctx: AudioContext, time: number, vol: number): void {
    [0, 0.1].forEach((delay, i) => {
      const freq = [200, 150][i];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol * 0.2, time + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, time + delay + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time + delay);
      osc.stop(time + delay + 0.1);
    });
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private findSound(key: string, category?: SoundCategory): SoundConfig | null {
    if (category) {
      return audioManifest[category]?.[key] ?? null;
    }

    // Search all categories
    for (const cat of ['sfx', 'ui', 'music'] as const) {
      if (audioManifest[cat]?.[key]) {
        return audioManifest[cat][key];
      }
    }
    return null;
  }

  private getVolumeForCategory(category: SoundCategory): number {
    switch (category) {
      case 'sfx': return SettingsManager.getSfxVolume() / 100;
      case 'ui': return SettingsManager.getUiVolume() / 100;
      case 'music': return SettingsManager.getMusicVolume() / 100;
      default: return 1;
    }
  }

  private playBuffer(buffer: AudioBuffer, volume: number, pitch: number, loop: boolean): void {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.playbackRate.value = pitch;
    source.loop = loop;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
  }

  /**
   * Preload audio files from manifest.
   * Call from PreloadScene after init().
   */
  async preloadFromManifest(): Promise<void> {
    if (!this.audioContext) return;

    const loadPromises: Promise<void>[] = [];

    for (const category of ['sfx', 'ui', 'music'] as const) {
      const sounds = audioManifest[category];
      if (!sounds) continue;

      for (const [key, config] of Object.entries(sounds)) {
        if (config.path) {
          loadPromises.push(this.loadSound(key, config.path));
        }
      }
    }

    await Promise.all(loadPromises);
    console.log(`[AudioManager] Preloaded ${this.loadedSounds.size} sounds`);
  }

  private async loadSound(key: string, path: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.loadedSounds.set(key, audioBuffer);
    } catch (error) {
      console.warn(`[AudioManager] Failed to load sound '${key}' from '${path}':`, error);
    }
  }
}

// Export singleton
export const AudioManager = new AudioManagerClass();
