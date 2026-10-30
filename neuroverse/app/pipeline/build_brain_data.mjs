// Derive line data from the brain model (no vertex is moved or added):
//  - contours.bin / contours.json: horizontal (axial) cross-sections of the outer brain surfaces,
//    for the scene 1 build and the scene 5 drawing;
//  - landmarks.json: the central and lateral sulci of the left hemisphere, traced where the
//    model's lobe meshes meet, for the scene 2 landmark trace.
// Usage: node pipeline/build_brain_data.mjs <brain.glb> <out dir>
import { writeFileSync } from 'node:fs'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { MeshoptDecoder } from 'meshoptimizer'

const [input, outDir] = process.argv.slice(2)
await MeshoptDecoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
const doc = await io.read(input)

/** World-space positions, normals and triangles per node (applies the quantisation transform). */
const parts = {}
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh()
  if (!mesh) continue
  const prim = mesh.listPrimitives()[0]
  const m = node.getWorldMatrix()
  const pa = prim.getAttribute('POSITION'), na = prim.getAttribute('NORMAL')
  const n = pa.getCount()
  const P = new Float64Array(n * 3), N = new Float64Array(n * 3)
  const p = [0, 0, 0], q = [0, 0, 0]
  for (let i = 0; i < n; i++) {
    pa.getElement(i, p)
    P[i * 3] = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]
    P[i * 3 + 1] = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]
    P[i * 3 + 2] = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]
    na.getElement(i, q)
    const l = Math.hypot(q[0], q[1], q[2]) || 1
    N[i * 3] = q[0] / l; N[i * 3 + 1] = q[1] / l; N[i * 3 + 2] = q[2] / l
  }
  parts[node.getName()] = { P, N, I: prim.getIndices().getArray(), extras: node.getExtras() }
}

// ---- Contours ------------------------------------------------------------------------------
const OUTER = ['frontal', 'parietal', 'temporal', 'occipital', 'insula', 'limbic', 'cerebellum', 'brainstem']
let ymin = Infinity, ymax = -Infinity
for (const part of Object.values(parts)) for (let i = 1; i < part.P.length; i += 3) { ymin = Math.min(ymin, part.P[i]); ymax = Math.max(ymax, part.P[i]) }
const PLANES = 44
const planes = []
const Q = 4000 // 1 unit = 100 mm; stored as int16 at 1/4000 unit = 0.025 mm
const all = []
for (let k = 0; k < PLANES; k++) {
  const y = ymax - ((k + 0.5) * (ymax - ymin)) / PLANES
  const start = all.length / 4
  for (const [name, part] of Object.entries(parts)) {
    if (!OUTER.includes(part.extras.region)) continue
    const { P, I } = part
    for (let t = 0; t < I.length; t += 3) {
      const pts = []
      for (let e = 0; e < 3; e++) {
        const a = I[t + e] * 3, b = I[t + ((e + 1) % 3)] * 3
        const da = P[a + 1] - y, db = P[b + 1] - y
        if ((da < 0) !== (db < 0)) {
          const f = da / (da - db)
          pts.push(P[a] + f * (P[b] - P[a]), P[a + 2] + f * (P[b + 2] - P[a + 2]))
        }
      }
      if (pts.length === 4) all.push(...pts)
    }
  }
  planes.push({ y: +y.toFixed(5), start, count: all.length / 4 - start })
}
const bin = new Int16Array(all.length)
for (let i = 0; i < all.length; i++) bin[i] = Math.round(all[i] * Q)
writeFileSync(`${outDir}/contours.bin`, Buffer.from(bin.buffer))
writeFileSync(`${outDir}/contours.json`, JSON.stringify({ scale: 1 / Q, planes }))
console.log('contour segments', all.length / 4, 'bytes', bin.byteLength)

// ---- Landmarks -----------------------------------------------------------------------------
/** Vertices of part A within `tol` of part B, on the lateral (patient-left, +z) surface. */
function boundary(aNames, bNames, tol) {
  const cell = tol, grid = new Map()
  const key = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`
  for (const b of bNames) {
    const { P } = parts[b]
    for (let i = 0; i < P.length; i += 3) {
      const k = key(P[i], P[i + 1], P[i + 2])
      if (!grid.has(k)) grid.set(k, [])
      grid.get(k).push(i, P)
    }
  }
  const out = []
  for (const a of aNames) {
    const { P, N } = parts[a]
    for (let i = 0; i < P.length; i += 3) {
      if (N[i + 2] < 0.2) continue // facing the left-lateral viewer
      const cx = Math.floor(P[i] / cell), cy = Math.floor(P[i + 1] / cell), cz = Math.floor(P[i + 2] / cell)
      let near = false
      for (let dx = -1; dx <= 1 && !near; dx++) for (let dy = -1; dy <= 1 && !near; dy++) for (let dz = -1; dz <= 1 && !near; dz++) {
        const list = grid.get(`${cx + dx},${cy + dy},${cz + dz}`)
        if (!list) continue
        for (let j = 0; j < list.length; j += 2) {
          const Bp = list[j + 1], o = list[j]
          if (Math.hypot(P[i] - Bp[o], P[i + 1] - Bp[o + 1], P[i + 2] - Bp[o + 2]) < tol) { near = true; break }
        }
      }
      if (near) out.push([P[i], P[i + 1], P[i + 2], N[i], N[i + 1], N[i + 2]])
    }
  }
  return out
}

/** Order boundary points along their main direction and average them in bins into a polyline. */
function polyline(pts, bins) {
  const c = [0, 0, 0]
  for (const p of pts) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2] }
  c.forEach((_, i) => (c[i] /= pts.length))
  // principal direction by power iteration on the covariance (x, y only: the lateral view)
  let d = [1, 0]
  for (let it = 0; it < 30; it++) {
    let nx = 0, ny = 0
    for (const p of pts) { const u = p[0] - c[0], v = p[1] - c[1], s = u * d[0] + v * d[1]; nx += s * u; ny += s * v }
    const l = Math.hypot(nx, ny); d = [nx / l, ny / l]
  }
  const proj = pts.map((p) => (p[0] - c[0]) * d[0] + (p[1] - c[1]) * d[1])
  const lo = Math.min(...proj), hi = Math.max(...proj)
  const acc = Array.from({ length: bins }, () => [0, 0, 0, 0, 0, 0, 0])
  pts.forEach((p, i) => {
    const b = Math.min(bins - 1, Math.floor(((proj[i] - lo) / (hi - lo)) * bins))
    for (let k = 0; k < 6; k++) acc[b][k] += p[k]
    acc[b][6]++
  })
  let line = acc.filter((a) => a[6] > 0).map((a) => {
    const n = a[6]
    const nrm = [a[3] / n, a[4] / n, a[5] / n], l = Math.hypot(...nrm) || 1
    // lifted 0.6 mm along the mean normal so the line sits on, not in, the surface
    return [0, 1, 2].map((k) => a[k] / n + (nrm[k] / l) * 0.006)
  })
  // Three passes of neighbour averaging remove the sampling zigzag (ends held in place).
  for (let pass = 0; pass < 3; pass++) {
    line = line.map((p, i) => (i === 0 || i === line.length - 1 ? p : p.map((c, k) => (line[i - 1][k] + 2 * c + line[i + 1][k]) / 4)))
  }
  return line.map((p) => p.map((c) => +c.toFixed(5)))
}

const central = boundary(['frontal_left'], ['parietal_left'], 0.012)
const lateral = boundary(['temporal_left'], ['frontal_left', 'parietal_left'], 0.012)
const landmarks = {
  central: { name: 'Central sulcus', points: polyline(central, 14), samples: central.length },
  lateral: { name: 'Lateral sulcus', points: polyline(lateral, 18), samples: lateral.length },
}
writeFileSync(`${outDir}/landmarks.json`, JSON.stringify(landmarks))
console.log('landmark samples', central.length, lateral.length)
