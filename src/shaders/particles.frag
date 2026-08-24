// ─────────────────────────────────────────────────────────────────────────────
// particles.frag — Fragment shader
//
// Key upgrade over basic circle shaders:
//   - Gaussian falloff instead of hard circle edge
//     → soft, physically-based glow without shadowBlur overhead
//   - Luminance-driven color temperature
//     → hot core = white-blue, cool outer = palette color
//   - Chromatic fringe at edges (subtle optical dispersion)
// ─────────────────────────────────────────────────────────────────────────────

uniform vec3  uColorCore;       // hot inner color (white-blue usually)
uniform vec3  uColorMid;        // mid-range palette color
uniform vec3  uColorOuter;      // cool outer particle color
uniform float uBloomThreshold;  // 0.0–1.0 — passed to postprocessing SelectiveBloom

varying float vLuminance;       // from vertex shader
varying float vDistToCenter;    // from vertex shader

void main() {
  // ── Step 1: Distance from center of this gl_Point quad ──
  // gl_PointCoord: (0,0)=top-left, (1,1)=bottom-right
  vec2  uv   = gl_PointCoord - 0.5;
  float dist = length(uv);

  // Discard anything outside the unit circle
  if (dist > 0.5) discard;

  // ── Step 2: Gaussian alpha falloff ──
  // exp(-k * d²) produces physically accurate light falloff
  // k controls sharpness: 8 = moderately soft, 20 = very sharp core
  float k     = 8.0 + vLuminance * 12.0;   // brighter particles = sharper core
  float alpha = exp(-k * dist * dist * 4.0);

  // ── Step 3: Color temperature mixing based on luminance ──
  // High luminance (overlapping dense regions) → white-hot core color
  // Low luminance (outer sparse particles)     → cool palette color
  vec3 color = mix(uColorOuter, uColorMid,  smoothstep(0.0, 0.5, vLuminance));
  color      = mix(color,       uColorCore, smoothstep(0.4, 1.0, vLuminance));

  // ── Step 4: Chromatic fringe at the particle edge ──
  // Real lenses bend different wavelengths at different angles.
  // We fake it by tinting the edge toward red/blue.
  float edgeFactor = smoothstep(0.3, 0.5, dist);
  color.r += edgeFactor * 0.15;
  color.b += edgeFactor * 0.25;

  // ── Step 5: Output ──
  // Alpha is kept high for core particles so SelectiveBloom picks them up
  gl_FragColor = vec4(color, alpha * (0.6 + vLuminance * 0.4));
}
