// ─────────────────────────────────────────────────────────────────────────────
// ParticleSystem.tsx — core 3D particle component
//
// Wires together:
//   - Silhouette geometry (typed buffer attributes)
//   - Custom GLSL shaders with curl noise displacement
//   - useFrame animation loop (updates uniforms every frame)
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo }  from 'react'
import { useFrame }         from '@react-three/fiber'
import * as THREE           from 'three'
import { type Palette }     from '../config/palettes'
import { generateSilhouette } from '../utils/silhouette'

// Import GLSL as raw strings — Vite handles ?raw suffix
import curlGLSL    from '../shaders/curlNoise.glsl?raw'
import vertexGLSL  from '../shaders/particles.vert?raw'
import fragmentGLSL from '../shaders/particles.frag?raw'

// Inject curl noise functions into vertex shader at the top
const fullVertexShader = curlGLSL + '\n' + vertexGLSL

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  particleCount: number
  dispersion:    number
  noiseScale:    number   // curl noise frequency
  noiseSpeed:    number   // curl noise time evolution speed
  palette:       Palette
}

export default function ParticleSystem({
  particleCount,
  dispersion,
  noiseScale,
  noiseSpeed,
  palette,
}: Props) {
  const pointsRef   = useRef<THREE.Points>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  // ── Generate geometry — only rebuilds when particleCount changes ──
  const { positions, scales, luminances } = useMemo(
    () => generateSilhouette(particleCount),
    [particleCount]
  )

  // ── Shader uniforms — initialized once ───────────────────────────────────
  const uniforms = useMemo(() => ({
    uTime:       { value: 0 },
    uDispersion: { value: dispersion },
    uNoiseScale: { value: noiseScale },
    uNoiseSpeed: { value: noiseSpeed },
    uColorCore:  { value: new THREE.Color(palette.colorCore) },
    uColorMid:   { value: new THREE.Color(palette.colorMid) },
    uColorOuter: { value: new THREE.Color(palette.colorOuter) },
  }), []) // intentionally empty — values updated imperatively below

  // ── Animation loop — runs at 60fps without re-rendering React ────────────
  useFrame(({ clock }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms

    u.uTime.value       = clock.getElapsedTime()
    u.uDispersion.value = dispersion
    u.uNoiseScale.value = noiseScale
    u.uNoiseSpeed.value = noiseSpeed
    u.uColorCore.value.set(palette.colorCore)
    u.uColorMid.value.set(palette.colorMid)
    u.uColorOuter.value.set(palette.colorOuter)

    // Very slow passive rotation — feels alive without being distracting
    if (pointsRef.current) {
      const t = clock.getElapsedTime()
      pointsRef.current.rotation.y = t * 0.03
      pointsRef.current.rotation.x = Math.sin(t * 0.008) * 0.1
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* Base positions — the silhouette anchor points */}
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        {/* Per-particle base size */}
        <bufferAttribute attach="attributes-aScale"     args={[scales, 1]} />
        {/* Same as position — used in shader as the "home" position */}
        <bufferAttribute attach="attributes-aBasePos"   args={[positions, 3]} />
        {/* 0–1 luminance drives bloom intensity + color temperature */}
        <bufferAttribute attach="attributes-aLuminance" args={[luminances, 1]} />
      </bufferGeometry>

      <shaderMaterial
        ref={materialRef}
        vertexShader={fullVertexShader}
        fragmentShader={fragmentGLSL}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        // Additive blending: particles add light together — dense clusters = bright
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
