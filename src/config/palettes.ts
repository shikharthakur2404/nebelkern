// ─────────────────────────────────────────────────────────────────────────────
// palettes.ts — color themes with postprocessing hints
// ─────────────────────────────────────────────────────────────────────────────

export interface Palette {
  label:          string
  colorCore:      string   // hot center (high luminance)
  colorMid:       string   // mid-range
  colorOuter:     string   // cool outer particles
  bloomIntensity: number   // SelectiveBloom strength
  bloomThreshold: number   // min luminance before bloom kicks in
  fogColor:       string   // background fog/atmosphere color
}

export const PALETTES: Record<string, Palette> = {
  cosmicBlue: {
    label:          'Cosmic Blue',
    colorCore:      '#e0f0ff',
    colorMid:       '#38bdf8',
    colorOuter:     '#1e3a8a',
    bloomIntensity: 1.8,
    bloomThreshold: 0.85,
    fogColor:       '#060d14',
  },

  etherealGold: {
    label:          'Ethereal Gold',
    colorCore:      '#fffbeb',
    colorMid:       '#fbbf24',
    colorOuter:     '#78350f',
    bloomIntensity: 2.2,
    bloomThreshold: 0.80,
    fogColor:       '#0d0800',
  },

  navyMauve: {
    label:          'Navy Mauve',
    colorCore:      '#fdf4ff',
    colorMid:       '#c084fc',
    colorOuter:     '#3b0764',
    bloomIntensity: 1.6,
    bloomThreshold: 0.88,
    fogColor:       '#080911',
  },

  auroraGreen: {
    label:          'Aurora',
    colorCore:      '#ecfdf5',
    colorMid:       '#34d399',
    colorOuter:     '#064e3b',
    bloomIntensity: 1.5,
    bloomThreshold: 0.82,
    fogColor:       '#010d08',
  },

  infrared: {
    label:          'Infrared',
    colorCore:      '#fff1f2',
    colorMid:       '#f43f5e',
    colorOuter:     '#881337',
    bloomIntensity: 2.5,
    bloomThreshold: 0.75,
    fogColor:       '#0d0305',
  },
}
