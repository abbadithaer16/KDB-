/** Writes base64 .txt twins of the binary assets for the private-preview host. */
import fs from 'node:fs'
import path from 'node:path'
const dir = process.argv[2] || 'dist-preview'
for (const rel of ['models/ring.glb', 'models/necklace.glb', 'models/bracelet.glb', 'env/studio.hdr', 'env/gems.hdr']) {
  const src = path.join(dir, rel)
  fs.writeFileSync(src + '.txt', fs.readFileSync(src).toString('base64'))
  console.log(rel + '.txt', fs.statSync(src + '.txt').size)
}
