// For the private claude.ai preview only: that host runs a page's own scripts and styles only when
// they are inline, so the built index.html gets its module script, stylesheet and fonts inlined.
// Data files stay separate and are published next to the page.
// Usage: VITE_MODEL_B64=1 npx vite build --outDir <dir> && node pipeline/inline_preview.mjs <dir> <out.html>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [dir, output] = process.argv.slice(2)
let html = readFileSync(join(dir, 'index.html'), 'utf8')
const read = (rel) => readFileSync(join(dir, rel.replace(/^\.\//, '')))
const MIME = { woff2: 'font/woff2', woff: 'font/woff', png: 'image/png', svg: 'image/svg+xml' }

html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, href) => {
  const css = read(href).toString('utf8').replace(/url\(([^)]+)\)/g, (m, u) => {
    const clean = u.replace(/["']/g, '')
    const ext = clean.split('.').pop()
    if (!MIME[ext]) return m
    return `url(data:${MIME[ext]};base64,${read(join('assets', clean.split('/').pop())).toString('base64')})`
  })
  return `<style>${css}</style>`
})
html = html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, (_, src) => {
  const js = read(src).toString('utf8').replace(/<\/script/g, '<\\/script')
  return `<script type="module">${js}</script>`
})
html = html.replace(/<link rel="modulepreload"[^>]*>/g, '')
// The host wraps the page in its own document skeleton (charset and viewport included).
html = html
  .replace(/<!doctype html>|<\/?html[^>]*>|<\/?head>|<\/?body>|<meta charset[^>]*>|<meta name="viewport"[^>]*>/gi, '')
  .trim()
if (/src="\.\/assets|href="\.\/assets/.test(html)) throw new Error('an asset reference was left un-inlined')
writeFileSync(output, html)
console.log('inlined page bytes', Buffer.byteLength(html))
