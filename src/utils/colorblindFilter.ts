/**
 * Colorblind Filter Utility
 *
 * Applies CSS filters to the game canvas to simulate/correct colorblind vision.
 * Uses SVG filters for accurate color transformation matrices.
 *
 * Three types supported:
 * - Protanopia (red-weak/red-blind)
 * - Deuteranopia (green-weak/green-blind)
 * - Tritanopia (blue-weak/blue-blind)
 */

import type { ColorblindMode } from '../types';

// SVG filter definitions for each colorblind type
// These matrices are based on scientific research for accurate simulation
const FILTER_MATRICES: Record<string, string> = {
  // Protanopia - reds appear darker, confusion between red/green
  protanopia: `
    0.567, 0.433, 0,     0, 0
    0.558, 0.442, 0,     0, 0
    0,     0.242, 0.758, 0, 0
    0,     0,     0,     1, 0
  `,

  // Deuteranopia - most common, green-blind
  deuteranopia: `
    0.625, 0.375, 0,   0, 0
    0.7,   0.3,   0,   0, 0
    0,     0.3,   0.7, 0, 0
    0,     0,     0,   1, 0
  `,

  // Tritanopia - blue-blind (rarest)
  tritanopia: `
    0.95, 0.05,  0,     0, 0
    0,    0.433, 0.567, 0, 0
    0,    0.475, 0.525, 0, 0
    0,    0,     0,     1, 0
  `,
};

let currentFilter: SVGSVGElement | null = null;
let currentMode: ColorblindMode = 'none';

/**
 * Create or update the SVG filter element in the DOM.
 */
function ensureFilterElement(): SVGSVGElement {
  let svg = document.getElementById('colorblind-filter-svg') as unknown as SVGSVGElement;

  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'colorblind-filter-svg');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.pointerEvents = 'none';
    document.body.appendChild(svg);
  }

  return svg;
}

/**
 * Apply a colorblind filter to the game canvas.
 */
export function applyColorblindFilter(mode: ColorblindMode): void {
  if (mode === currentMode) return;
  currentMode = mode;

  const canvas = document.querySelector('#game-container canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    console.warn('[ColorblindFilter] Game canvas not found');
    return;
  }

  if (mode === 'none') {
    // Remove filter
    canvas.style.filter = '';
    if (currentFilter) {
      currentFilter.remove();
      currentFilter = null;
    }
    console.log('[ColorblindFilter] Filter removed');
    return;
  }

  const matrix = FILTER_MATRICES[mode];
  if (!matrix) {
    console.warn(`[ColorblindFilter] Unknown mode: ${mode}`);
    return;
  }

  // Create SVG filter
  const svg = ensureFilterElement();
  svg.innerHTML = `
    <defs>
      <filter id="colorblind-filter">
        <feColorMatrix type="matrix" values="${matrix.replace(/\s+/g, ' ').trim()}" />
      </filter>
    </defs>
  `;

  currentFilter = svg;

  // Apply filter to canvas
  canvas.style.filter = 'url(#colorblind-filter)';
  console.log(`[ColorblindFilter] Applied ${mode} filter`);
}

/**
 * Get the currently active colorblind mode.
 */
export function getCurrentMode(): ColorblindMode {
  return currentMode;
}

/**
 * Get a display name for a colorblind mode.
 */
export function getModeDisplayName(mode: ColorblindMode): string {
  switch (mode) {
    case 'none': return 'None';
    case 'protanopia': return 'Protanopia (Red-Weak)';
    case 'deuteranopia': return 'Deuteranopia (Green-Weak)';
    case 'tritanopia': return 'Tritanopia (Blue-Weak)';
    default: return mode;
  }
}
