// For the private claude.ai preview only: the same quantised geometry without meshopt compression
// (that host may block WebAssembly and does not serve .glb), written as base64 text.
// Usage: node pipeline/make_preview_model.mjs <brain.glb> <out.b64.txt>
import { writeFileSync } from 'node:fs'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions'
import { MeshoptDecoder } from 'meshoptimizer'

const [input, output] = process.argv.slice(2)
await MeshoptDecoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
const doc = await io.read(input)
for (const ext of doc.getRoot().listExtensionsUsed()) if (ext instanceof EXTMeshoptCompression) ext.dispose()
const bytes = await io.writeBinary(doc)
writeFileSync(output, Buffer.from(bytes).toString('base64'))
console.log('plain GLB bytes', bytes.byteLength)
