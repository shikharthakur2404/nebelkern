// ─────────────────────────────────────────────────────────────────────────────
// particles.vert — Vertex shader for the particle system
//
// Each particle:
//   1. Starts at its base silhouette position
//   2. Gets displaced by curl noise (fluid turbulence)
//   3. Gets dispersed outward from center
//   4. Size scales with luminance so bright/core particles appear larger
// ─────────────────────────────────────────────────────────────────────────────

// Curl noise functions (injected at compile time via string concatenation)
// — see curlNoise.glsl

uniform float uTime;
uniform float uDispersion;   // 0–3: how far particles drift from silhouette
uniform float uNoiseScale;   // 0.5–3: frequency of the curl noise field
uniform float uNoiseSpeed;   // 0.1–2: how fast the curl field evolves over time

attribute float aScale;      // per-particle base size (randomized at spawn)
attribute vec3  aBasePos;    // original silhouette position (never changes)
attribute float aLuminance;  // 0–1, determines how much bloom this particle gets

// Passed to fragment shader
varying float vLuminance;
varying float vDistToCenter;

void main() {
  // ── Step 1: Sample curl noise at this particle's world position + time ──
  // uNoiseScale controls the "zoom level" of the turbulence.
  // Lower = big slow eddies. Higher = fine rapid turbulence.
  vec3 noisePos = aBasePos * uNoiseScale + vec3(uTime * uNoiseSpeed * 0.15);
  vec3 curl     = curlNoise(noisePos);

  // ── Step 2: Blend between base silhouette and curl-displaced position ──
  // At dispersion=0: particles hug the silhouette
  // At dispersion=3: particles fully follow the curl flow field
  vec3 displaced = aBasePos + curl * uDispersion * 0.6;

  // ── Step 3: Slight radial push so the silhouette stays readable at low dispersion ──
  float radial = length(aBasePos.xy);
  displaced   += normalize(vec3(aBasePos.xy, 0.0)) * radial * uDispersion * 0.05;

  // ── Step 3b: Sub-pixel micro-jitter (eliminates moiré/aliasing artifacts) ──
  float jitterSeed = aLuminance * 100.0 + uTime * 60.0;
  vec2 jitter = vec2(sin(jitterSeed * 12.9898), cos(jitterSeed * 78.233)) * 0.0015;
  displaced.xy += jitter;

  // ── Step 4: Pass data to fragment shader ──
  vLuminance    = aLuminance;
  vDistToCenter = length(displaced);

  // ── Step 5: Project to screen ──
  vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);

  // Particles closer to camera appear larger (perspective point sizing)
  float perspScale = 120.0 / -mvPos.z;
  gl_PointSize = aScale * perspScale * (0.5 + aLuminance * 0.8);

  gl_Position = projectionMatrix * mvPos;
}
