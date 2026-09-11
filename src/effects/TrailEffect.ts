// ─────────────────────────────────────────────────────────────────────────────
// TrailEffect.ts — Persistence / Velocity Trails Postprocessing Pass
//
// Fades previous frame buffers using a ping-pong accumulation buffer.
// Particles leave luminous fading trails behind as they advect through the
// curl noise velocity field.
// ─────────────────────────────────────────────────────────────────────────────

import { Effect, BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { wrapEffect } from '@react-three/postprocessing'

const fragmentShader = /* glsl */`
  uniform sampler2D tOld;
  uniform float uDamp;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 old = texture2D(tOld, uv);
    vec4 decayed = old * uDamp * step(0.015, max(old.r, max(old.g, old.b)));
    outputColor = max(inputColor, decayed);
  }
`

export class TrailEffectImpl extends Effect {
  private targetA: THREE.WebGLRenderTarget
  private targetB: THREE.WebGLRenderTarget
  private copyCamera: THREE.OrthographicCamera
  private copyScene: THREE.Scene
  private copyMaterial: THREE.ShaderMaterial
  private isFirstFrame = true

  constructor({ damp = 0.90 }: { damp?: number } = {}) {
    const uniforms = new Map<string, THREE.Uniform>([
      ['tOld', new THREE.Uniform(null)],
      ['uDamp', new THREE.Uniform(damp)],
    ])

    super('TrailEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms,
    })

    const options: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type: THREE.HalfFloatType,
      stencilBuffer: false,
      depthBuffer: false,
    }

    this.targetA = new THREE.WebGLRenderTarget(1, 1, options)
    this.targetB = new THREE.WebGLRenderTarget(1, 1, options)

    this.copyCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.copyScene = new THREE.Scene()
    this.copyMaterial = new THREE.ShaderMaterial({
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D tNew;
        uniform sampler2D tOld;
        uniform float uDamp;
        varying vec2 vUv;
        void main() {
          vec4 n = texture2D(tNew, vUv);
          vec4 o = texture2D(tOld, vUv);
          vec4 decayed = o * uDamp * step(0.015, max(o.r, max(o.g, o.b)));
          gl_FragColor = max(n, decayed);
        }
      `,
      uniforms: {
        tNew: { value: null },
        tOld: { value: null },
        uDamp: { value: damp },
      },
      depthTest: false,
      depthWrite: false,
    })

    const geom = new THREE.PlaneGeometry(2, 2)
    const copyQuad = new THREE.Mesh(geom, this.copyMaterial)
    this.copyScene.add(copyQuad)
  }

  get damp(): number {
    return (this.uniforms.get('uDamp')!.value as number)
  }

  set damp(value: number) {
    this.uniforms.get('uDamp')!.value = value
    this.copyMaterial.uniforms.uDamp.value = value
  }

  update(renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget): void {
    const width = inputBuffer.width
    const height = inputBuffer.height

    if (this.targetA.width !== width || this.targetA.height !== height) {
      this.targetA.setSize(width, height)
      this.targetB.setSize(width, height)
      this.isFirstFrame = true
    }

    const readTarget = this.targetA
    const writeTarget = this.targetB

    this.copyMaterial.uniforms.tNew.value = inputBuffer.texture
    this.copyMaterial.uniforms.tOld.value = this.isFirstFrame ? inputBuffer.texture : readTarget.texture

    const currentTarget = renderer.getRenderTarget()
    renderer.setRenderTarget(writeTarget)
    renderer.render(this.copyScene, this.copyCamera)
    renderer.setRenderTarget(currentTarget)

    this.uniforms.get('tOld')!.value = writeTarget.texture

    this.targetA = writeTarget
    this.targetB = readTarget
    this.isFirstFrame = false
  }

  dispose(): void {
    super.dispose()
    this.targetA.dispose()
    this.targetB.dispose()
    this.copyMaterial.dispose()
  }
}

export const Trail = wrapEffect(TrailEffectImpl)
