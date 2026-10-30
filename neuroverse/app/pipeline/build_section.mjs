// A true cross-section of the brain model at the scene 1 cut height, as a class map.
// For each grid point on the plane, a vertical ray counts crossings with every closed mesh above
// the plane: an odd count means the point lies inside that mesh. Where volumes overlap, deep
// nuclei win over white matter, and white matter over cortex, so the grey matter shows only where
// the model's cortex is not underlain by white matter. Nothing is drawn that the model does not
// contain. Usage: node pipeline/build_section.mjs <brain.glb> <out dir> <y>
import { writeFileSync } from 'node:fs'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { MeshoptDecoder } from 'meshoptimizer'

const [input, outDir, yArg] = process.argv.slice(2)
const Y = Number(yArg)
await MeshoptDecoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
const doc = await io.read(input)

const CLASS = { frontal: 1, parietal: 1, temporal: 1, occipital: 1, insula: 1, limbic: 1, whitematter: 2, callosum: 2, fornix: 2, basal: 3, thalamus: 3, hypothalamus: 3, hippocampus: 3, amygdala: 3, cerebellum: 4, brainstem: 4 }
const PRIORITY = { 1: 1, 4: 2, 2: 3, 3: 4 } // higher wins

const X0 = -1.0, X1 = 0.9, Z0 = -0.75, Z1 = 0.75
const D = 0.0025 // 0.25 mm
const NX = Math.round((X1 - X0) / D), NZ = Math.round((Z1 - Z0) / D)
const out = new Uint8Array(NX * NZ)

for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh()
  if (!mesh) continue
  const cls = CLASS[node.getExtras().region]
  if (!cls) continue
  const prim = mesh.listPrimitives()[0]
  const m = node.getWorldMatrix()
  const pa = prim.getAttribute('POSITION')
  const n = pa.getCount()
  const P = new Float64Array(n * 3)
  const p = [0, 0, 0]
  for (let i = 0; i < n; i++) {
    pa.getElement(i, p)
    P[i * 3] = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]
    P[i * 3 + 1] = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]
    P[i * 3 + 2] = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]
  }
  const I = prim.getIndices().getArray()
  const parity = new Uint8Array(NX * NZ)
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3
    const ax = P[a], az = P[a + 2], bx = P[b], bz = P[b + 2], cx = P[c], cz = P[c + 2]
    const ymax = Math.max(P[a + 1], P[b + 1], P[c + 1])
    if (ymax <= Y) continue
    const minx = Math.max(0, Math.floor((Math.min(ax, bx, cx) - X0) / D)), maxx = Math.min(NX - 1, Math.ceil((Math.max(ax, bx, cx) - X0) / D))
    const minz = Math.max(0, Math.floor((Math.min(az, bz, cz) - Z0) / D)), maxz = Math.min(NZ - 1, Math.ceil((Math.max(az, bz, cz) - Z0) / D))
    const det = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz)
    if (Math.abs(det) < 1e-14) continue
    for (let iz = minz; iz <= maxz; iz++) {
      const z = Z0 + (iz + 0.5) * D
      for (let ix = minx; ix <= maxx; ix++) {
        const x = X0 + (ix + 0.5) * D
        const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / det
        const l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / det
        const l3 = 1 - l1 - l2
        if (l1 < 0 || l2 < 0 || l3 < 0) continue
        const y = l1 * P[a + 1] + l2 * P[b + 1] + l3 * P[c + 1]
        if (y > Y) parity[iz * NX + ix] ^= 1
      }
    }
  }
  for (let i = 0; i < parity.length; i++) if (parity[i] && (PRIORITY[cls] ?? 0) > (PRIORITY[out[i]] ?? 0)) out[i] = cls
}
writeFileSync(`${outDir}/section.bin`, Buffer.from(out.buffer))
writeFileSync(`${outDir}/section.json`, JSON.stringify({ y: Y, x0: X0, z0: Z0, d: D, nx: NX, nz: NZ, classes: { 1: 'grey', 2: 'white', 3: 'deep', 4: 'hindbrain' } }))
const counts = [0, 0, 0, 0, 0]
for (const v of out) counts[v]++
console.log(JSON.stringify({ nx: NX, nz: NZ, counts }))
