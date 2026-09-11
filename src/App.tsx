// ─────────────────────────────────────────────────────────────────────────────
// App.tsx — root, state management, leva control panel
// ─────────────────────────────────────────────────────────────────────────────

import { useControls, folder, button } from 'leva'
import Scene        from './components/Scene'
import { PALETTES } from './config/palettes'
import './App.css'

// Palette keys as array for leva dropdown
const PALETTE_KEYS = Object.keys(PALETTES)
const PALETTE_OPTIONS = Object.fromEntries(
  PALETTE_KEYS.map(k => [PALETTES[k].label, k])
)

export default function App() {

  // ── Leva generates the control panel automatically from this config ──────
  // No JSX needed — leva renders a floating panel in the top-right corner.
  const {
    paletteKey,
    particleCount,
    dispersion,
    noiseScale,
    noiseSpeed,
    trailDamp,
  } = useControls('✦ nebelkern', {

    // Palette picker — dropdown of all palette names
    paletteKey: {
      label:   'Palette',
      value:   'cosmicBlue',
      options: PALETTE_OPTIONS,
    },

    // ── Simulation folder ───────────────────────────────────────────────────
    'Simulation': folder({
      dispersion: {
        label: 'Dispersion',
        value: 1.0,
        min:   0.0,
        max:   3.0,
        step:  0.05,
      },
      noiseScale: {
        label: 'Noise Scale',
        value: 1.2,
        min:   0.2,
        max:   4.0,
        step:  0.1,
        hint:  'Curl noise frequency — lower = big slow eddies',
      },
      noiseSpeed: {
        label: 'Noise Speed',
        value: 0.5,
        min:   0.0,
        max:   3.0,
        step:  0.05,
      },
      trailDamp: {
        label: 'Velocity Trails',
        value: 0.88,
        min:   0.0,
        max:   0.98,
        step:  0.01,
        hint:  'Persistence trail damping — higher = longer motion streamers',
      },
    }),

    // ── Rendering folder ────────────────────────────────────────────────────
    'Rendering': folder({
      particleCount: {
        label: 'Particle Count',
        value: 12000,
        min:   1000,
        max:   30000,
        step:  500,
      },
    }),

    // ── Preset save/load ────────────────────────────────────────────────────
    'Presets': folder({
      'Save Preset': button(() => {
        const preset = { paletteKey, particleCount, dispersion, noiseScale, noiseSpeed, trailDamp }
        const blob   = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' })
        const url    = URL.createObjectURL(blob)
        const a      = document.createElement('a')
        a.href = url
        a.download = `nebelkern-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
      }),
    }),

  })

  const palette = PALETTES[paletteKey as keyof typeof PALETTES]

  return (
    <div className="app">
      <Scene
        particleCount={particleCount}
        dispersion={dispersion}
        noiseScale={noiseScale}
        noiseSpeed={noiseSpeed}
        trailDamp={trailDamp}
        palette={palette}
      />
    </div>
  )
}
