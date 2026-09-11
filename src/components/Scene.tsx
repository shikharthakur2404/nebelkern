// ─────────────────────────────────────────────────────────────────────────────
// Scene.tsx — the R3F Canvas scene with postprocessing pipeline
//
// Postprocessing order matters:
//   1. Render particles (additive blending on GPU)
//   2. SelectiveBloom: halo around high-luminance clusters (threshold=0.85)
//   3. ChromaticAberration: subtle lens optical dispersion at edges
//   4. Vignette: darken corners to focus the eye on the silhouette
//   5. ToneMapping: compress HDR → SDR without washing out whites
// ─────────────────────────────────────────────────────────────────────────────

import { Canvas }          from '@react-three/fiber'
import { OrbitControls }   from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { Vector2 }         from 'three'
import ParticleSystem      from './ParticleSystem'
import { type Palette }    from '../config/palettes'
import { Trail }           from '../effects/TrailEffect'

interface Props {
  particleCount: number
  dispersion:    number
  noiseScale:    number
  noiseSpeed:    number
  trailDamp:     number
  palette:       Palette
}

export default function Scene(props: Props) {
  return (
    <Canvas
      // Camera pulled back enough to see full silhouette
      camera={{ position: [0, 0, 3.5], fov: 55 }}
      gl={{
        antialias:      true,
        alpha:          false,
        // LinearSRGBColorSpace needed for correct bloom color math
        outputColorSpace: 'srgb',
      }}
      style={{ background: props.palette.fogColor }}
    >
      {/* ── Particle cloud ── */}
      <ParticleSystem {...props} />

      {/* ── Mouse orbit: drag to rotate, scroll to zoom ── */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={8}
        autoRotate={false}
      />

      {/* ── Postprocessing pipeline ── */}
      <EffectComposer>

        {/*
          Velocity Trails / Persistence — fades previous frames over time,
          giving moving particles glowing motion streamers through the curl field.
        */}
        <Trail damp={props.trailDamp} />

        {/*
          Bloom — creates the volumetric light bleed around particle clusters.
          luminanceThreshold=0.85 means only the brightest overlapping regions bloom.
          This keeps individual outer stars crisp while the core glows intensely.
        */}
        <Bloom
          intensity={props.palette.bloomIntensity}
          luminanceThreshold={props.palette.bloomThreshold}
          luminanceSmoothing={0.1}
          mipmapBlur={true}   // smoother bloom at distance
        />

        {/*
          Chromatic Aberration — different wavelengths (R/G/B) focus at slightly
          different points in a real lens. Gives a slightly "optical" feel.
          Offset is tiny — just enough to notice on the outer glow edges.
        */}
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new Vector2(0.0008, 0.0008)}
          radialModulation={true}
          modulationOffset={0.4}
        />

        {/*
          Vignette — gradually darkens the corners.
          Focuses attention on the central silhouette.
        */}
        <Vignette
          eskil={false}
          offset={0.3}
          darkness={0.7}
        />

        {/*
          ToneMapping — maps HDR values to displayable SDR range.
          ACES filmic mode preserves color saturation better than linear.
        */}
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      </EffectComposer>
    </Canvas>
  )
}
