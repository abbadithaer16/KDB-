// Optimise the pipeline GLB for delivery and report size and precision.
// Usage: node pipeline/optimize.mjs <in.glb> <out.glb> [positionBits=14] [meshopt|plain]
// 'plain' skips meshopt compression (quantised only) for hosts that block WebAssembly.
import { readFileSync, statSync } from 'node:fs'
import { brotliCompressSync, gzipSync, constants } from 'node:zlib'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions'
import { quantize, reorder } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'

const [input, output, bitsArg] = process.argv.slice(2)
const positionBits = Number(bitsArg ?? 14)
const useMeshopt = (process.argv[5] ?? 'meshopt') !== 'plain'
await MeshoptEncoder.ready
await MeshoptDecoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
  'meshopt.decoder': MeshoptDecoder,
})

const doc = await io.read(input)
const before = new Map()
for (const mesh of doc.getRoot().listMeshes()) {
  before.set(mesh.getName(), mesh.listPrimitives()[0].getAttribute('POSITION').getArray().slice())
}

await doc.transform(
  reorder({ encoder: MeshoptEncoder, target: 'size' }),
  quantize({ quantizePosition: positionBits, quantizeNormal: 10, quantizeColor: 8 }),
)
if (useMeshopt) {
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({
    method: EXTMeshoptCompression.EncoderMethod.QUANTIZE,
  })
}
await io.write(output, doc)

// Precision check: decode the written file and compare each vertex with its original position
// (reorder changes vertex order, so compare sorted coordinates per axis as a bound).
const back = await io.read(output)
let maxErr = 0
for (const mesh of back.getRoot().listMeshes()) {
  const prim = mesh.listPrimitives()[0]
  const attr = prim.getAttribute('POSITION')
  const node = back.getRoot().listNodes().find((n) => n.getMesh() === mesh)
  const m = node.getMatrix() // quantize() moves the dequantisation transform onto the node
  const n = attr.getCount()
  const out = new Float32Array(n * 3)
  const el = [0, 0, 0]
  for (let i = 0; i < n; i++) {
    attr.getElement(i, el)
    out[i * 3] = m[0] * el[0] + m[4] * el[1] + m[8] * el[2] + m[12]
    out[i * 3 + 1] = m[1] * el[0] + m[5] * el[1] + m[9] * el[2] + m[13]
    out[i * 3 + 2] = m[2] * el[0] + m[6] * el[1] + m[10] * el[2] + m[14]
  }
  const src = before.get(mesh.getName())
  for (let axis = 0; axis < 3; axis++) {
    const a = Array.from({ length: n }, (_, i) => src[i * 3 + axis]).sort((x, y) => x - y)
    const b = Array.from({ length: n }, (_, i) => out[i * 3 + axis]).sort((x, y) => x - y)
    for (let i = 0; i < n; i++) maxErr = Math.max(maxErr, Math.abs(a[i] - b[i]))
  }
}

const raw = statSync(input).size
const buf = readFileSync(output)
const gz = gzipSync(buf, { level: 9 }).length
const br = brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length
const mb = (x) => (x / 1e6).toFixed(2) + ' MB'
console.log(JSON.stringify({
  positionBits, meshopt: useMeshopt,
  input: mb(raw), output: mb(buf.length), gzip: mb(gz), brotli: mb(br),
  maxPositionErrorModelUnits: maxErr.toFixed(5),
  maxPositionErrorMm: (maxErr * 100).toFixed(3), // 1 model unit = 100 mm
}))
