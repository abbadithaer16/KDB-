import { Color, MeshPhysicalMaterial } from 'three'
import type { IUniform } from 'three'

/** Shared per-frame uniforms, written by the signal driver (never through React state). */
export const signalUniforms = {
  uFront: { value: -1 } as IUniform<number>, // arc of the signal front in um; -1 = no signal
  uLead: { value: 2.5 } as IUniform<number>, // um of soft leading edge
  uTail: { value: 160 } as IUniform<number>, // um over which the depolarisation fades behind the front
  uTrace: { value: 0 } as IUniform<number>, // 0..1, the faint path trace after the signal
  uDim: { value: 0 } as IUniform<number>, // 0..1, everything except the signal path falls into shadow
  uViolet: { value: new Color('#9C86F0') } as IUniform<Color>,
  uGain: { value: 2.4 } as IUniform<number>,
  uPxScale: { value: 0.001 } as IUniform<number>, // world units per CSS pixel at distance 1
  uScale: { value: 0.01 } as IUniform<number>, // world units per local unit (um)
}

/**
 * Physical material whose vertices sit at centre + direction * radius, with the radius held
 * at a minimum on-screen width (uMinPx) so fine branches stay visible in distant views. Close
 * up, the recorded radius wins. Emission marks the signal on the recorded path only.
 */
export function tubeMaterial(params: ConstructorParameters<typeof MeshPhysicalMaterial>[0], minPx: number) {
  const m = new MeshPhysicalMaterial(params)
  const local = { uMinPx: { value: minPx } }
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, signalUniforms, local)
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute float aRadius; attribute float aArc; attribute float aKind;
uniform float uMinPx; uniform float uPxScale; uniform float uScale;
varying float vArc; varying float vKind;`,
      )
      .replace(
        '#include <begin_vertex>',
        `vec4 nvCentre = modelMatrix * vec4(position, 1.0);
float nvDist = length(cameraPosition - nvCentre.xyz);
float nvPathW = (aArc >= 0.0 && aKind > 1.5) ? 1.6 : 1.0;
float nvRadius = max(aRadius, uMinPx * nvPathW * 0.5 * uPxScale * nvDist / uScale);
vec3 transformed = position + normal * nvRadius;
vArc = aArc; vKind = aKind;`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uFront; uniform float uLead; uniform float uTail; uniform float uTrace; uniform float uDim;
uniform vec3 uViolet; uniform float uGain;
varying float vArc; varying float vKind;`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
float nvOnPath = step(0.0, vArc) * step(1.5, vKind) * step(vKind, 2.5);
float nvSheath = step(0.0, vArc) * step(3.5, vKind);
float nvPara = step(0.0, vArc) * smoothstep(4.0, 5.0, vKind);
float nvGlow = 0.0;
if (uFront >= 0.0) {
  float lead = smoothstep(uFront + uLead, uFront, vArc);
  nvGlow = lead * exp(-max(uFront - vArc, 0.0) / uTail);
}
float nvE = nvOnPath * (nvGlow + 0.6 * uTrace) + nvSheath * (0.05 * nvGlow + 0.12 * uTrace) + nvPara * (1.8 * nvGlow + 0.5 * uTrace);
totalEmissiveRadiance += uViolet * nvE * uGain;`,
      )
      .replace(
        '#include <opaque_fragment>',
        `outgoingLight *= mix(1.0, 0.28, uDim * (1.0 - max(nvOnPath, nvSheath)));
#include <opaque_fragment>`,
      )
  }
  m.customProgramCacheKey = () => `tube-${minPx}`
  return m
}
