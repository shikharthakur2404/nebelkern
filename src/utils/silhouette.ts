// ─────────────────────────────────────────────────────────────────────────────
// silhouette.ts — humanoid silhouette point cloud generator
//
// Generates {x, y, z} coordinates distributed in the shape of a human body.
// These become the "base positions" that particles orbit around.
// ─────────────────────────────────────────────────────────────────────────────

export interface ParticleData {
  positions:  Float32Array  // x,y,z per particle
  scales:     Float32Array  // base point size per particle
  luminances: Float32Array  // 0–1, drives color temperature + bloom
}

// Returns a random {x, y} offset from body center
// Origin (0,0) = vertical mid-chest. Y axis points up.
function sampleSilhouette(): [number, number] {
  const u = Math.random()

  // ── Head ──
  if (u < 0.12) {
    const r     = Math.sqrt(Math.random()) * 0.22
    const theta = Math.random() * Math.PI * 2
    return [r * Math.cos(theta), 0.90 + r * Math.sin(theta)]
  }

  // ── Neck ──
  if (u < 0.15) {
    return [(Math.random() - 0.5) * 0.12, 0.65 + Math.random() * 0.12]
  }

  // ── Shoulders / Upper torso ──
  if (u < 0.40) {
    const h    = Math.random()
    const span = 0.45 * Math.sin(h * Math.PI * 0.5 + Math.PI * 0.25)
    return [(Math.random() - 0.5) * span * 2, 0.3 + h * 0.35]
  }

  // ── Lower torso / Hips ──
  if (u < 0.62) {
    const h    = Math.random()
    const span = 0.22 + h * 0.08
    return [(Math.random() - 0.5) * span * 2, -0.1 + h * 0.4]
  }

  // ── Arms ──
  if (u < 0.76) {
    const side     = Math.random() > 0.5 ? 1 : -1
    const progress = Math.random()
    return [
      side * (0.4 + progress * 0.18),
      0.45 - progress * 0.55,
    ]
  }

  // ── Legs — dissolve at bottom ──
  const leg      = Math.random() > 0.5 ? 0.12 : -0.12
  const progress = Math.random()
  const spread   = 0.08 + progress * 0.15  // legs splay outward as they go down
  return [
    leg + (Math.random() - 0.5) * spread,
    -0.3 - progress * 0.75,
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export: generate all particle data as typed arrays
// ─────────────────────────────────────────────────────────────────────────────
export function generateSilhouette(count: number): ParticleData {
  const positions  = new Float32Array(count * 3)
  const scales     = new Float32Array(count)
  const luminances = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const [x, y] = sampleSilhouette()

    // Small Z jitter so particles aren't perfectly flat
    const z = (Math.random() - 0.5) * 0.08

    positions[i * 3]     = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    // Particles near the center of the body = brighter (more luminant)
    const distFromCenter = Math.sqrt(x * x + y * y)
    const rawLum         = Math.max(0, 1.0 - distFromCenter * 1.2)
    luminances[i]        = rawLum * rawLum + Math.random() * 0.15  // slight randomness

    // Brighter particles are rendered larger
    scales[i] = 0.8 + luminances[i] * 1.8 + Math.random() * 0.6
  }

  return { positions, scales, luminances }
}
