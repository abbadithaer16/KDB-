import { BackSide, Color, DoubleSide, MeshBasicMaterial, MeshPhysicalMaterial, Plane, Vector3 } from 'three'
import type { IUniform } from 'three'
import { TOKENS } from '../rig'

/** Uniforms shared by every brain material; written once per frame from the rig. */
export const brainUniforms = {
  uBuild: { value: 1 } as IUniform<number>, // 0..1 slab fill (scene 1)
  uBandTop: { value: 0.79 } as IUniform<number>,
  uBandSpacing: { value: 0.0377 } as IUniform<number>,
  uShell: { value: 0 } as IUniform<number>, // 0..1 translucent cortex (scene 4, desktop)
  uSweepX: { value: -2 } as IUniform<number>, // fragments anterior of this x are drawn as line work (scene 5)
  uPlate: { value: TOKENS.plate.clone() } as IUniform<Color>,
  uInk: { value: new Color(TOKENS.ink) } as IUniform<Color>,
  uSweepInk: { value: new Color(TOKENS.violetInk) } as IUniform<Color>,
}

/** Shared clipping planes (three keeps the side where n·p + c >= 0). Disabled = constant 1e3. */
export const planes = {
  axialLow: new Plane(new Vector3(0, -1, 0), 1e3), // keeps the part below the horizontal cut
  axialHigh: new Plane(new Vector3(0, 1, 0), 1e3), // keeps the part above it (the lifted copy)
  midRight: new Plane(new Vector3(0, 0, -1), 1e3), // keeps the right half of midline parts
  midLeft: new Plane(new Vector3(0, 0, 1), 1e3), // keeps the left half of midline parts
  cutaway: new Plane(new Vector3(0, 0, -1), 1e3), // scene 4 window on phones: removes lateral left cortex
  none: new Plane(new Vector3(0, 1, 0), 1e3),
}

export type TissueRole = { cortex: boolean; ink: number }

/**
 * Brain tissue. One draw per mesh covers every mode:
 *  - back faces are drawn flat in the cut colour, so any clip or slab reads as a solid cut face;
 *  - slabs: fragments outside the filled part of each 1/44 band are discarded (scene 1 build);
 *  - shell: cortex fades to a Fresnel edge and stops writing depth (scene 4, desktop);
 *  - line work: anterior of the sweep, the surface is redrawn as ink on the plate from its own
 *    silhouette and cavity (sulci), with a violet ink line where the sweep passes (scene 5).
 */
export function tissueMaterial(hex: string, capHex: string, clip: Plane[], role: TissueRole) {
  const m = new MeshPhysicalMaterial({
    color: hex,
    vertexColors: true, // cavity term from the pipeline darkens sulci
    roughness: 0.55,
    sheen: 0.5,
    sheenRoughness: 0.55,
    sheenColor: new Color('#D9C9C1'),
    clearcoat: 0.12,
    clearcoatRoughness: 0.45,
    side: DoubleSide,
    clippingPlanes: clip,
  })
  const local = {
    uCap: { value: new Color(capHex) },
    uCortex: { value: role.cortex ? 1 : 0 },
    uInkWeight: { value: role.ink },
  }
  m.userData.local = local
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, brainUniforms, local)
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorld;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    s.fragmentShader = s.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vWorld;
uniform float uBuild; uniform float uBandTop; uniform float uBandSpacing; uniform float uShell; uniform float uSweepX;
uniform vec3 uPlate; uniform vec3 uInk; uniform vec3 uSweepInk; uniform vec3 uCap; uniform float uCortex; uniform float uInkWeight;`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
if (uBuild < 0.999) {
  float band = fract((uBandTop - vWorld.y) / uBandSpacing);
  if (band > uBuild) discard;
}
bool nvLine = vWorld.x < uSweepX;
if (!gl_FrontFacing && ((uShell > 0.01 && uCortex > 0.5) || nvLine)) discard;`,
      )
      .replace(
        '#include <opaque_fragment>',
        `vec3 nvV = normalize(vViewPosition);
float nvNdV = abs(dot(normal, nvV));
if (!gl_FrontFacing) {
  // Cut face: flat, evenly lit, so it reads as a section rather than as tissue.
  outgoingLight = uCap * 0.82;
}
if (uCortex > 0.5 && uShell > 0.0) {
  float fres = pow(1.0 - nvNdV, 2.0);
  diffuseColor.a = mix(1.0, 0.04 + 0.5 * fres, uShell);
  outgoingLight = mix(outgoingLight, outgoingLight * 0.6 + vec3(0.56, 0.53, 0.70) * fres * 0.5, uShell);
}
if (nvLine) {
  float cav = vColor.r;
  float sil = 1.0 - smoothstep(0.12, 0.42, nvNdV);
  float sulc = smoothstep(0.8, 0.58, cav);
  float inkAmt = clamp(max(sil, sulc * 0.85) * uInkWeight, 0.0, 1.0);
  outgoingLight = mix(uPlate, uInk, inkAmt);
  diffuseColor.a = 1.0;
  float edge = 1.0 - smoothstep(0.0, 0.006, abs(vWorld.x - uSweepX + 0.003));
  outgoingLight = mix(outgoingLight, uSweepInk, edge * step(uSweepX, 0.95));
}
#include <opaque_fragment>`,
      )
  }
  m.customProgramCacheKey = () => `tissue-${clip.length}-${role.cortex ? 1 : 0}`
  return m
}

/** Inverted hull for selection: back faces pushed out along the normal, drawn in violet. */
export function outlineMaterial(clip: Plane[], localOffset: number) {
  const m = new MeshBasicMaterial({ color: TOKENS.violet, side: BackSide, clippingPlanes: clip, transparent: true, opacity: 0, depthWrite: false })
  m.visible = false
  m.onBeforeCompile = (s) => {
    s.uniforms.uOutline = { value: localOffset }
    s.vertexShader = 'uniform float uOutline;\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normal * uOutline;')
  }
  m.customProgramCacheKey = () => `outline-${clip.length}`
  return m
}
