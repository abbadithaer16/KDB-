import { Color, MeshPhysicalMaterial, Vector3 } from 'three'
import type { IUniform } from 'three'

/** Shared per-frame uniforms, written by the signal driver (never through React state). */
export const signalUniforms = {
  uFront: { value: -1 } as IUniform<number>, // arc of the signal front in um; -1 = no signal
  uLead: { value: 2.5 } as IUniform<number>, // um of soft leading edge
  uTail: { value: 160 } as IUniform<number>, // um over which the depolarisation fades behind the front
  uGlow: { value: 1 } as IUniform<number>, // scale of the path glow (lower at rest)
  uTrace: { value: 0 } as IUniform<number>, // 0..1, the faint path trace after the signal
  uDim: { value: 0 } as IUniform<number>, // 0..1, everything except the signal path falls into shadow
  uViolet: { value: new Color('#9C86F0') } as IUniform<Color>,
  uGain: { value: 2.4 } as IUniform<number>,
  uPxScale: { value: 0.001 } as IUniform<number>, // world units per CSS pixel at distance 1
  uScale: { value: 0.01 } as IUniform<number>, // world units per local unit (um)
  uRefDist: { value: 10 } as IUniform<number>, // subject distance: the minimum width is set here, so it keeps perspective
  uPathW: { value: 1.6 } as IUniform<number>, // minimum-width multiplier for the signal path (the highlighted structure)
  // The signal as a light: it illuminates membrane around the front (illustrative, tagged).
  uFrontPos: { value: new Vector3() } as IUniform<Vector3>,
  uSigLight: { value: 0 } as IUniform<number>,
  uSigRadius: { value: 0.3 } as IUniform<number>, // world units
  // Back-rim: the scene 2 desaturated violet, so every branch has an edge against the dark.
  uRim: { value: new Color('#8F86B3') } as IUniform<Color>,
  uRimStrength: { value: 0.75 } as IUniform<number>,
  // Depth-graded exposure (aerial perspective): darker and cooler with distance from focus.
  uDepthNear: { value: 10 } as IUniform<number>,
  uDepthFar: { value: 20 } as IUniform<number>,
}

/**
 * Physical material whose vertices sit at centre + direction * radius, with the radius held
 * at a minimum on-screen width (uMinPx) so fine branches stay visible in distant views. Close
 * up, the recorded radius wins. Lighting additions: a Fresnel rim, depth-graded exposure, the
 * signal's own light, and emission on the recorded path only.
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
uniform float uMinPx; uniform float uPxScale; uniform float uScale; uniform float uPathW; uniform float uRefDist;
varying float vArc; varying float vKind;`,
      )
      .replace(
        '#include <begin_vertex>',
        `vec4 nvCentre = modelMatrix * vec4(position, 1.0);
float nvDist = length(cameraPosition - nvCentre.xyz);
float nvPathW = (aArc >= 0.0 && aKind > 1.5) ? uPathW : 1.0;
// Minimum radius fixed in world space at the subject distance (so nearer branches draw thicker,
// as real tubes would), with a 1 px floor so the farthest branches never vanish.
float nvRadius = max(aRadius, max(uMinPx * nvPathW * 0.5 * uPxScale * uRefDist, 0.5 * uPxScale * nvDist) / uScale);
vec3 transformed = position + normal * nvRadius;
vArc = aArc; vKind = aKind;`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uFront; uniform float uLead; uniform float uTail; uniform float uTrace; uniform float uDim;
uniform float uGlow; uniform vec3 uViolet; uniform float uGain;
uniform vec3 uFrontPos; uniform float uSigLight; uniform float uSigRadius;
uniform vec3 uRim; uniform float uRimStrength; uniform float uDepthNear; uniform float uDepthFar;
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
  nvGlow = uGlow * lead * exp(-max(uFront - vArc, 0.0) / uTail);
}
float nvE = nvOnPath * (nvGlow + 0.6 * uTrace) + nvSheath * (0.05 * nvGlow + 0.08 * uTrace) + nvPara * (1.8 * nvGlow + 0.4 * uTrace);
totalEmissiveRadiance += uViolet * nvE * uGain;`,
      )
      .replace(
        '#include <opaque_fragment>',
        `vec3 nvV = normalize(vViewPosition);
float nvF = pow(1.0 - clamp(dot(normal, nvV), 0.0, 1.0), 2.4);
outgoingLight += uRim * nvF * uRimStrength;
outgoingLight *= mix(1.0, 0.3, uDim * (1.0 - max(nvOnPath, nvSheath)));
float nvDepth = smoothstep(uDepthNear, uDepthFar, vViewPosition.z);
outgoingLight = mix(outgoingLight, outgoingLight * vec3(0.26, 0.29, 0.38), nvDepth);
if (uSigLight > 0.0) {
  vec3 nvFrontV = (viewMatrix * vec4(uFrontPos, 1.0)).xyz;
  vec3 nvToL = nvFrontV + vViewPosition;
  float nvD = length(nvToL);
  float nvNdl = max(dot(normal, nvToL / max(nvD, 1e-5)), 0.0);
  outgoingLight += uViolet * uSigLight / (1.0 + pow(nvD / uSigRadius, 2.0)) * (0.2 + 0.8 * nvNdl);
}
#include <opaque_fragment>`,
      )
  }
  m.customProgramCacheKey = () => `tube-${minPx}`
  return m
}
