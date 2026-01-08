/**
 * SETTINGS SCENE
 * Full-screen settings menu with tabs for different categories.
 * Supports both keyboard and mouse navigation.
 *
 * Categories:
 * - Visual: Colorblind modes, font scaling, screen shake
 * - Audio: Music/SFX/UI volume sliders, mute toggle
 * - Controls: Key rebinding, mouse-only mode
 * - Gameplay: Show letter order (debug assist)
 */

import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { SettingsManager } from '../systems/SettingsManager';
import type { ColorblindMode, FontScale } from '../types';

type SettingCategory = 'visual' | 'audio' | 'controls' | 'gameplay';

interface SettingItem {
  key: string;
  label: string;
  type: 'toggle' | 'slider' | 'select' | 'keybind';
  getValue: () => unknown;
  setValue: (value: unknown) => void;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export class SettingsScene extends Phaser.Scene {
  private tabs: Phaser.GameObjects.Container[] = [];
  private settingItems: Phaser.GameObjects.Container[] = [];
  private selectedTabIndex: number = 0;
  private selectedItemIndex: number = 0;
  private currentCategory: SettingCategory = 'visual';
  private settingsContent!: Phaser.GameObjects.Container;
  private isRebinding: boolean = false;
  private rebindTarget: string | null = null;

  // Settings definitions by category
  private categorySettings: Record<SettingCategory, SettingItem[]> = {
    visual: [
      {
        key: 'colorblind',
        label: 'Colorblind Mode',
        type: 'select',
        getValue: () => SettingsManager.getColorblindMode(),
        setValue: (v) => SettingsManager.setColorblindMode(v as ColorblindMode),
        options: [
          { value: 'none', label: 'None' },
          { value: 'protanopia', label: 'Protanopia (Red-Weak)' },
          { value: 'deuteranopia', label: 'Deuteranopia (Green-Weak)' },
          { value: 'tritanopia', label: 'Tritanopia (Blue-Weak)' },
        ],
      },
      {
        key: 'fontScale',
        label: 'UI Font Size',
        type: 'select',
        getValue: () => SettingsManager.getFontScale(),
        setValue: (v) => SettingsManager.setFontScale(v as FontScale),
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
      },
      {
        key: 'screenShake',
        label: 'Screen Shake',
        type: 'toggle',
        getValue: () => SettingsManager.isScreenShakeEnabled(),
        setValue: (v) => SettingsManager.setScreenShake(v as boolean),
      },
    ],
    audio: [
      {
        key: 'musicVolume',
        label: 'Music Volume',
        type: 'slider',
        getValue: () => SettingsManager.getAudio().musicVolume,
        setValue: (v) => SettingsManager.setMusicVolume(v as number),
        min: 0,
        max: 100,
        step: 5,
      },
      {
        key: 'sfxVolume',
        label: 'SFX Volume',
        type: 'slider',
        getValue: () => SettingsManager.getAudio().sfxVolume,
        setValue: (v) => SettingsManager.setSfxVolume(v as number),
        min: 0,
        max: 100,
        step: 5,
      },
      {
        key: 'uiVolume',
        label: 'UI Sounds Volume',
        type: 'slider',
        getValue: () => SettingsManager.getAudio().uiVolume,
        setValue: (v) => SettingsManager.setUiVolume(v as number),
        min: 0,
        max: 100,
        step: 5,
      },
      {
        key: 'muteAll',
        label: 'Mute All',
        type: 'toggle',
        getValue: () => SettingsManager.isMuted(),
        setValue: (v) => SettingsManager.setMuteAll(v as boolean),
      },
    ],
    controls: [
      {
        key: 'mouseOnlyMode',
        label: 'Mouse-Only Mode (Click letters)',
        type: 'toggle',
        getValue: () => SettingsManager.isMouseOnlyMode(),
        setValue: (v) => SettingsManager.setMouseOnlyMode(v as boolean),
      },
      {
        key: 'pause',
        label: 'Pause Key',
        type: 'keybind',
        getValue: () => SettingsManager.getKeyBindings().pause,
        setValue: (v) => SettingsManager.setKeyBinding('pause', v as string),
      },
    ],
    gameplay: [
      {
        key: 'showLetterOrder',
        label: 'Show Letter Order (Debug)',
        type: 'toggle',
        getValue: () => SettingsManager.isShowLetterOrder(),
        setValue: (v) => SettingsManager.setShowLetterOrder(v as boolean),
      },
    ],
  };

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    this.selectedTabIndex = 0;
    this.selectedItemIndex = 0;
    this.currentCategory = 'visual';
    this.tabs = [];
    this.settingItems = [];
    this.isRebinding = false;
    this.rebindTarget = null;

    this.createBackground();
    this.createTitle();
    this.createTabs();
    this.createSettingsContainer();
    this.renderSettings();
    this.createFooter();
    this.setupInput();

    // Initial highlight
    this.updateTabSelection(0);
  }

  private createBackground(): void {
    // Solid background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x010201);

    // Border frame
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 40, GAME_HEIGHT - 40, 0x000000)
      .setStrokeStyle(3, COLORS.TERMINAL_GREEN);
  }

  private createTitle(): void {
    const title = this.add.text(GAME_WIDTH / 2, 50, 'SETTINGS', {
      fontFamily: 'VT323, monospace',
      fontSize: '48px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

    title.setShadow(0, 0, COLORS.TERMINAL_GREEN_CSS, 10, true, true);
  }

  private createTabs(): void {
    const categories: { key: SettingCategory; label: string }[] = [
      { key: 'visual', label: 'VISUAL' },
      { key: 'audio', label: 'AUDIO' },
      { key: 'controls', label: 'CONTROLS' },
      { key: 'gameplay', label: 'GAMEPLAY' },
    ];

    const tabWidth = 150;
    const startX = GAME_WIDTH / 2 - (categories.length * tabWidth) / 2 + tabWidth / 2;
    const tabY = 110;

    categories.forEach((cat, index) => {
      const container = this.add.container(startX + index * tabWidth, tabY);

      const bg = this.add.rectangle(0, 0, tabWidth - 10, 40, 0x000000)
        .setStrokeStyle(2, COLORS.TERMINAL_GREEN);

      const label = this.add.text(0, 0, cat.label, {
        fontFamily: 'VT323, monospace',
        fontSize: '22px',
        color: COLORS.TERMINAL_GREEN_CSS,
      }).setOrigin(0.5);

      container.add([bg, label]);
      container.setData('bg', bg);
      container.setData('label', label);
      container.setData('category', cat.key);

      // Mouse interaction
      bg.setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.updateTabSelection(index))
        .on('pointerdown', () => this.selectTab(index));

      this.tabs.push(container);
    });
  }

  private createSettingsContainer(): void {
    // Container for settings content (will be cleared and rebuilt when tab changes)
    this.settingsContent = this.add.container(0, 160);
  }

  private renderSettings(): void {
    // Clear existing items
    this.settingsContent.removeAll(true);
    this.settingItems = [];

    const settings = this.categorySettings[this.currentCategory];
    const startY = 20;
    const itemHeight = 60;
    const leftX = 200;
    const rightX = GAME_WIDTH - 200;

    settings.forEach((setting, index) => {
      const y = startY + index * itemHeight;
      const container = this.createSettingRow(leftX, rightX, y, setting, index);
      this.settingsContent.add(container);
      this.settingItems.push(container);
    });

    // Reset selection
    this.selectedItemIndex = 0;
    if (this.settingItems.length > 0) {
      this.updateItemSelection(0);
    }
  }

  private createSettingRow(
    leftX: number,
    rightX: number,
    y: number,
    setting: SettingItem,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(0, y);

    // Label
    const label = this.add.text(leftX, 0, setting.label, {
      fontFamily: 'VT323, monospace',
      fontSize: '26px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0, 0.5);

    container.add(label);

    // Selection indicator (hidden by default)
    const indicator = this.add.text(leftX - 30, 0, '>', {
      fontFamily: 'VT323, monospace',
      fontSize: '26px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0);

    container.add(indicator);
    container.setData('indicator', indicator);
    container.setData('setting', setting);
    container.setData('index', index);

    // Control based on type
    switch (setting.type) {
      case 'toggle':
        this.createToggleControl(container, rightX, setting);
        break;
      case 'slider':
        this.createSliderControl(container, rightX, setting);
        break;
      case 'select':
        this.createSelectControl(container, rightX, setting);
        break;
      case 'keybind':
        this.createKeybindControl(container, rightX, setting);
        break;
    }

    return container;
  }

  private createToggleControl(
    container: Phaser.GameObjects.Container,
    x: number,
    setting: SettingItem
  ): void {
    const value = setting.getValue() as boolean;
    const toggleBg = this.add.rectangle(x, 0, 80, 30, 0x000000)
      .setStrokeStyle(2, COLORS.TERMINAL_GREEN);

    const toggleFill = this.add.rectangle(
      x + (value ? 20 : -20),
      0,
      36,
      24,
      value ? COLORS.TERMINAL_GREEN : 0x333333
    );

    const toggleText = this.add.text(x, 0, value ? 'ON' : 'OFF', {
      fontFamily: 'VT323, monospace',
      fontSize: '18px',
      color: value ? '#000000' : COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

    container.add([toggleBg, toggleFill, toggleText]);
    container.setData('toggleBg', toggleBg);
    container.setData('toggleFill', toggleFill);
    container.setData('toggleText', toggleText);

    // Interactive
    toggleBg.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleSetting(container));
  }

  private createSliderControl(
    container: Phaser.GameObjects.Container,
    x: number,
    setting: SettingItem
  ): void {
    const value = setting.getValue() as number;
    const sliderWidth = 200;
    const sliderX = x - sliderWidth / 2;

    // Track
    const track = this.add.rectangle(x, 0, sliderWidth, 8, 0x333333);

    // Filled portion
    const fillWidth = (value / (setting.max || 100)) * sliderWidth;
    const fill = this.add.rectangle(
      sliderX + fillWidth / 2,
      0,
      fillWidth,
      8,
      COLORS.TERMINAL_GREEN
    );

    // Value text
    const valueText = this.add.text(x + sliderWidth / 2 + 40, 0, `${value}%`, {
      fontFamily: 'VT323, monospace',
      fontSize: '22px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0, 0.5);

    container.add([track, fill, valueText]);
    container.setData('track', track);
    container.setData('fill', fill);
    container.setData('valueText', valueText);
    container.setData('sliderX', sliderX);
    container.setData('sliderWidth', sliderWidth);

    // Interactive
    track.setInteractive({ useHandCursor: true })
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.adjustSliderFromPointer(container, pointer);
      });
  }

  private createSelectControl(
    container: Phaser.GameObjects.Container,
    x: number,
    setting: SettingItem
  ): void {
    const currentValue = setting.getValue() as string;
    const options = setting.options || [];
    const currentOption = options.find(o => o.value === currentValue);

    // Background
    const selectBg = this.add.rectangle(x, 0, 280, 32, 0x000000)
      .setStrokeStyle(2, COLORS.TERMINAL_GREEN);

    // Arrows
    const leftArrow = this.add.text(x - 130, 0, '<', {
      fontFamily: 'VT323, monospace',
      fontSize: '24px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

    const rightArrow = this.add.text(x + 130, 0, '>', {
      fontFamily: 'VT323, monospace',
      fontSize: '24px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

    // Current value
    const selectText = this.add.text(x, 0, currentOption?.label || currentValue, {
      fontFamily: 'VT323, monospace',
      fontSize: '20px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

    container.add([selectBg, leftArrow, rightArrow, selectText]);
    container.setData('selectBg', selectBg);
    container.setData('selectText', selectText);
    container.setData('leftArrow', leftArrow);
    container.setData('rightArrow', rightArrow);

    // Interactive
    leftArrow.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.cycleSelect(container, -1));
    rightArrow.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.cycleSelect(container, 1));
    selectBg.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.cycleSelect(container, 1));
  }

  private createKeybindControl(
    container: Phaser.GameObjects.Container,
    x: number,
    setting: SettingItem
  ): void {
    const value = setting.getValue() as string;

    const keybindBg = this.add.rectangle(x, 0, 120, 32, 0x000000)
      .setStrokeStyle(2, COLORS.TERMINAL_GREEN);

    const keybindText = this.add.text(x, 0, value, {
      fontFamily: 'VT323, monospace',
      fontSize: '22px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

    container.add([keybindBg, keybindText]);
    container.setData('keybindBg', keybindBg);
    container.setData('keybindText', keybindText);

    // Interactive
    keybindBg.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.startRebind(container));
  }

  private updateTabSelection(index: number): void {
    this.selectedTabIndex = index;

    this.tabs.forEach((tab, i) => {
      const bg = tab.getData('bg') as Phaser.GameObjects.Rectangle;
      const label = tab.getData('label') as Phaser.GameObjects.Text;

      if (i === index) {
        bg.setFillStyle(COLORS.TERMINAL_GREEN, 0.2);
        bg.setStrokeStyle(3, COLORS.OVERDRIVE_WHITE);
        label.setColor(COLORS.TERMINAL_GREEN_CSS);
      } else if (tab.getData('category') === this.currentCategory) {
        bg.setFillStyle(COLORS.TERMINAL_GREEN, 0.1);
        bg.setStrokeStyle(2, COLORS.TERMINAL_GREEN);
        label.setColor(COLORS.TERMINAL_GREEN_CSS);
      } else {
        bg.setFillStyle(0x000000, 1);
        bg.setStrokeStyle(2, COLORS.TERMINAL_GREEN);
        label.setColor(COLORS.TERMINAL_GREEN_CSS);
      }
    });
  }

  private selectTab(index: number): void {
    this.selectedTabIndex = index;
    this.currentCategory = this.tabs[index].getData('category') as SettingCategory;
    this.renderSettings();
    this.updateTabSelection(index);
  }

  private updateItemSelection(index: number): void {
    this.selectedItemIndex = index;

    this.settingItems.forEach((item, i) => {
      const indicator = item.getData('indicator') as Phaser.GameObjects.Text;
      indicator.setAlpha(i === index ? 1 : 0);
    });
  }

  private toggleSetting(container: Phaser.GameObjects.Container): void {
    const setting = container.getData('setting') as SettingItem;
    const currentValue = setting.getValue() as boolean;
    const newValue = !currentValue;

    setting.setValue(newValue);

    // Update visual - use absolute positions based on the toggle control's center X
    const toggleBg = container.getData('toggleBg') as Phaser.GameObjects.Rectangle;
    const toggleFill = container.getData('toggleFill') as Phaser.GameObjects.Rectangle;
    const toggleText = container.getData('toggleText') as Phaser.GameObjects.Text;

    const centerX = toggleBg.x;
    toggleFill.setX(centerX + (newValue ? 20 : -20));
    toggleFill.setFillStyle(newValue ? COLORS.TERMINAL_GREEN : 0x333333);
    toggleText.setText(newValue ? 'ON' : 'OFF');
    toggleText.setColor(newValue ? '#000000' : COLORS.TERMINAL_GREEN_CSS);
  }

  private adjustSlider(container: Phaser.GameObjects.Container, delta: number): void {
    const setting = container.getData('setting') as SettingItem;
    const step = setting.step || 5;
    const min = setting.min || 0;
    const max = setting.max || 100;
    const currentValue = setting.getValue() as number;
    const newValue = Math.max(min, Math.min(max, currentValue + delta * step));

    setting.setValue(newValue);
    this.updateSliderVisual(container, newValue, max);
  }

  private adjustSliderFromPointer(
    container: Phaser.GameObjects.Container,
    pointer: Phaser.Input.Pointer
  ): void {
    const setting = container.getData('setting') as SettingItem;
    const sliderX = container.getData('sliderX') as number;
    const sliderWidth = container.getData('sliderWidth') as number;
    const min = setting.min || 0;
    const max = setting.max || 100;

    // Calculate value from pointer position
    const localX = pointer.x - sliderX;
    const ratio = Math.max(0, Math.min(1, localX / sliderWidth));
    const newValue = Math.round(min + ratio * (max - min));

    setting.setValue(newValue);
    this.updateSliderVisual(container, newValue, max);
  }

  private updateSliderVisual(
    container: Phaser.GameObjects.Container,
    value: number,
    max: number
  ): void {
    const fill = container.getData('fill') as Phaser.GameObjects.Rectangle;
    const valueText = container.getData('valueText') as Phaser.GameObjects.Text;
    const sliderX = container.getData('sliderX') as number;
    const sliderWidth = container.getData('sliderWidth') as number;

    const fillWidth = (value / max) * sliderWidth;
    fill.setX(sliderX + fillWidth / 2);
    fill.setSize(fillWidth, 8);
    valueText.setText(`${value}%`);
  }

  private cycleSelect(container: Phaser.GameObjects.Container, direction: number): void {
    const setting = container.getData('setting') as SettingItem;
    const options = setting.options || [];
    const currentValue = setting.getValue() as string;
    const currentIndex = options.findIndex(o => o.value === currentValue);
    const newIndex = (currentIndex + direction + options.length) % options.length;
    const newOption = options[newIndex];

    setting.setValue(newOption.value);

    // Update visual
    const selectText = container.getData('selectText') as Phaser.GameObjects.Text;
    selectText.setText(newOption.label);
  }

  private startRebind(container: Phaser.GameObjects.Container): void {
    const setting = container.getData('setting') as SettingItem;
    this.isRebinding = true;
    this.rebindTarget = setting.key;

    const keybindText = container.getData('keybindText') as Phaser.GameObjects.Text;
    const keybindBg = container.getData('keybindBg') as Phaser.GameObjects.Rectangle;

    keybindText.setText('Press key...');
    keybindBg.setStrokeStyle(3, COLORS.WARNING_ORANGE);
  }

  private handleRebind(key: string): void {
    if (!this.isRebinding || !this.rebindTarget) return;

    const container = this.settingItems[this.selectedItemIndex];
    const setting = container.getData('setting') as SettingItem;

    setting.setValue(key);

    // Update visual
    const keybindText = container.getData('keybindText') as Phaser.GameObjects.Text;
    const keybindBg = container.getData('keybindBg') as Phaser.GameObjects.Rectangle;

    keybindText.setText(key);
    keybindBg.setStrokeStyle(2, COLORS.TERMINAL_GREEN);

    this.isRebinding = false;
    this.rebindTarget = null;
  }

  private createFooter(): void {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, '[TAB/Q/E] SWITCH TAB  •  [W/S] SELECT  •  [A/D] ADJUST  •  [ESC] BACK', {
      fontFamily: 'VT323, monospace',
      fontSize: '18px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.5);

    // Back button
    const backBtn = this.add.text(80, GAME_HEIGHT - 50, '< BACK', {
      fontFamily: 'VT323, monospace',
      fontSize: '24px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0, 0.5);

    backBtn.setInteractive({ useHandCursor: true })
      .on('pointerover', () => backBtn.setColor('#ffffff'))
      .on('pointerout', () => backBtn.setColor(COLORS.TERMINAL_GREEN_CSS))
      .on('pointerdown', () => this.goBack());

    // Reset button
    const resetBtn = this.add.text(GAME_WIDTH - 80, GAME_HEIGHT - 50, 'RESET DEFAULTS', {
      fontFamily: 'VT323, monospace',
      fontSize: '20px',
      color: COLORS.WARNING_ORANGE_CSS || '#ff8800',
    }).setOrigin(1, 0.5);

    resetBtn.setInteractive({ useHandCursor: true })
      .on('pointerover', () => resetBtn.setColor('#ffffff'))
      .on('pointerout', () => resetBtn.setColor('#ff8800'))
      .on('pointerdown', () => this.resetDefaults());
  }

  private setupInput(): void {
    // Tab navigation
    this.input.keyboard?.on('keydown-TAB', () => {
      if (this.isRebinding) return;
      const newIndex = (this.selectedTabIndex + 1) % this.tabs.length;
      this.selectTab(newIndex);
    });

    this.input.keyboard?.on('keydown-Q', () => {
      if (this.isRebinding) return;
      const newIndex = (this.selectedTabIndex - 1 + this.tabs.length) % this.tabs.length;
      this.selectTab(newIndex);
    });

    this.input.keyboard?.on('keydown-E', () => {
      if (this.isRebinding) return;
      const newIndex = (this.selectedTabIndex + 1) % this.tabs.length;
      this.selectTab(newIndex);
    });

    // Item navigation
    this.input.keyboard?.on('keydown-UP', () => this.navigateItems(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.navigateItems(1));
    this.input.keyboard?.on('keydown-W', () => this.navigateItems(-1));
    this.input.keyboard?.on('keydown-S', () => this.navigateItems(1));

    // Adjust values
    this.input.keyboard?.on('keydown-LEFT', () => this.adjustSelected(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.adjustSelected(1));
    this.input.keyboard?.on('keydown-A', () => this.adjustSelected(-1));
    this.input.keyboard?.on('keydown-D', () => this.adjustSelected(1));

    // Confirm (for toggles and keybinds)
    this.input.keyboard?.on('keydown-ENTER', () => this.activateSelected());
    this.input.keyboard?.on('keydown-SPACE', () => this.activateSelected());

    // Back
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.isRebinding) {
        // Cancel rebind
        this.isRebinding = false;
        this.rebindTarget = null;
        this.renderSettings();
      } else {
        this.goBack();
      }
    });

    // Keybind capture (captures any key when rebinding)
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.isRebinding && event.key !== 'Escape') {
        this.handleRebind(event.key.toUpperCase());
      }
    });
  }

  private navigateItems(direction: number): void {
    if (this.isRebinding) return;
    if (this.settingItems.length === 0) return;

    const newIndex = (this.selectedItemIndex + direction + this.settingItems.length) % this.settingItems.length;
    this.updateItemSelection(newIndex);
  }

  private adjustSelected(direction: number): void {
    if (this.isRebinding) return;
    if (this.settingItems.length === 0) return;

    const container = this.settingItems[this.selectedItemIndex];
    const setting = container.getData('setting') as SettingItem;

    switch (setting.type) {
      case 'toggle':
        this.toggleSetting(container);
        break;
      case 'slider':
        this.adjustSlider(container, direction);
        break;
      case 'select':
        this.cycleSelect(container, direction);
        break;
    }
  }

  private activateSelected(): void {
    if (this.settingItems.length === 0) return;

    const container = this.settingItems[this.selectedItemIndex];
    const setting = container.getData('setting') as SettingItem;

    switch (setting.type) {
      case 'toggle':
        this.toggleSetting(container);
        break;
      case 'keybind':
        this.startRebind(container);
        break;
      case 'select':
        this.cycleSelect(container, 1);
        break;
    }
  }

  private resetDefaults(): void {
    SettingsManager.resetToDefaults();
    this.renderSettings();
  }

  private goBack(): void {
    // Return to the scene that launched settings
    this.scene.start('MenuScene');
  }
}
