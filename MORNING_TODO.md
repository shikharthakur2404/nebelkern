# Morning TODO

---

## 1. Portfolio Website ❌ Not started

- Personal portfolio site
- Showcase **FytlY** (99k LOC React Native app)
  - Screen recordings
  - Screenshots
  - Case study / write-up
- Showcase **sternstaub** + **nebelkern** + **nebelkern-metal**
- Showcase seminar paper — *"The Productivity Paradox of Generative AI in Software Development"*

### Decisions to make in morning
- Stack? (Next.js / Astro / plain React)
- Design direction? (minimal dark sci-fi fits the vibe)
- Host on Vercel / GitHub Pages?

---

## 2. AAA Visual Upgrades

## nebelkern (R3F + GLSL + Postprocessing)

### ✅ Already implemented
- Gaussian falloff `exp(-k·d²)` in `particles.frag`
- 3D Curl Noise (Bridson 2007) in `curlNoise.glsl`
- Bloom threshold 0.85 in `Scene.tsx`

### ❌ Still missing — add in morning
- **Velocity Trails / Persistence pass**
  - Option A: fading previous frame buffer (accumulation buffer — blend current frame over last with ~0.92 alpha)
  - Option B: instanced line strips per particle (more expensive, more accurate)
  - Easiest: `AfterImage` effect from `@react-three/postprocessing` — one line

---

## nebelkern-metal (Swift + Metal) — build from scratch

Full MSL compute pipeline. All 4 AAA techniques native:

1. **Gaussian glow** — procedural in MSL fragment shader, `alpha = exp(-k * dist * dist)`
2. **3D Curl Noise** — compute shader, GPU-side, zero CPU overhead (Apple Silicon UMA)
3. **Thresholded Bloom** — Metal Performance Shaders (MPS) or custom threshold pass
4. **Velocity Trails** — persistence via `MTLTexture` ping-pong buffers (render to texture A, blend into texture B, display B)

### Stack
- `MetalKit` (MTKView render loop)
- MSL compute shaders (particle velocity + curl advection)
- Native EDR — particles > 1.0 luminance on Liquid Retina XDR
- `NSWindow.Level.belowNormal` → live wallpaper behind desktop icons
- SwiftUI control panel (dispersion, drift, palette, particle count)

### Prerequisites
- Xcode installed (`xcode-select --install`)
- macOS 13+ (for EDR APIs)

---

## sternstaub (Canvas 2D) — leave as-is
Simple version by design. No upgrades needed.
