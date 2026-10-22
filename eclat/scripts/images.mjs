/**
 * Builds responsive AVIF/WebP ladders + LQIP placeholders into public/img and
 * writes src/lib/images.json (dimensions, widths, provenance).
 *   node scripts/images.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const outDir = path.join(root, 'public/img')
fs.mkdirSync(outDir, { recursive: true })

const LADDER = [480, 800, 1200, 1800, 2400]
const sources = []

const stills = path.join(root, 'assets-src/stills')
for (const f of fs.readdirSync(stills).filter((f) => f.endsWith('.png') && !f.startsWith('draft_'))) {
  sources.push({ key: f.replace('.png', ''), file: path.join(stills, f), source: 'render' })
}
// fall back to drafts for shots whose final render is not finished yet
for (const f of fs.readdirSync(stills).filter((f) => f.startsWith('draft_'))) {
  const key = f.replace('draft_', '').replace('.png', '')
  if (!sources.find((s) => s.key === key)) sources.push({ key, file: path.join(stills, f), source: 'render-draft' })
}
const client = path.join(root, 'assets-src/client')
for (const f of fs.readdirSync(client).filter((f) => f.endsWith('.png'))) {
  sources.push({ key: f.replace('.png', ''), file: path.join(client, f), source: 'client' })
}

const manifest = {}
for (const s of sources) {
  const img = sharp(s.file)
  const { width, height } = await img.metadata()
  const widths = LADDER.filter((w) => w < width * 0.98)
  widths.push(Math.min(width, 2400))
  const uniq = [...new Set(widths)].sort((a, b) => a - b)
  for (const w of uniq) {
    const base = sharp(s.file).resize({ width: w })
    await base.clone().avif({ quality: 52, effort: 4 }).toFile(path.join(outDir, `${s.key}-${w}.avif`))
    await base.clone().webp({ quality: 78 }).toFile(path.join(outDir, `${s.key}-${w}.webp`))
  }
  const lqip = await sharp(s.file).resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer()
  manifest[s.key] = {
    w: width,
    h: height,
    widths: uniq,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    source: s.source,
  }
  console.log(s.key.padEnd(24), `${width}x${height}`, uniq.join(','), s.source)
}
fs.writeFileSync(path.join(root, 'src/lib/images.json'), JSON.stringify(manifest, null, 2))
