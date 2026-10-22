/**
 * Visual QA harness: node tests/shoot.mjs <outDir> <w> <h> [mobile] [stops...]
 * stops are fractions of total scroll height, or "#id:frac" for section-relative positions.
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const [outDir, W, H, mobileFlag, ...stopsArg] = process.argv.slice(2)
const mobile = mobileFlag === 'mobile'
const url = process.env.URL || 'http://127.0.0.1:5173/'
fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
})
const ctx = await browser.newContext({
  viewport: { width: +W, height: +H },
  deviceScaleFactor: 1,
  isMobile: mobile,
  hasTouch: mobile,
  reducedMotion: process.env.RM ? 'reduce' : 'no-preference',
})
const page = await ctx.newPage()
const logs = []
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && logs.push(`[${m.type()}] ${m.text()} @ ${m.location().url.split('/').pop()}:${m.location().lineNumber}`))
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
const t0 = Date.now()
await page.goto(url + (process.env.QS || ''), { waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => !document.querySelector('.preloader'), null, { timeout: 180000 })
console.log('loaded in', Date.now() - t0, 'ms')
await page.waitForTimeout(+(process.env.INTRO || 5200))

const stops = stopsArg.length ? stopsArg : ['0']
let i = 0
for (const s of stops) {
  const y = await page.evaluate((s) => {
    let y
    if (s.startsWith('#')) {
      const [id, f] = s.slice(1).split(':')
      const el = document.getElementById(id)
      const top = el.getBoundingClientRect().top + window.scrollY
      y = top + (el.offsetHeight - window.innerHeight) * parseFloat(f || '0')
    } else y = (document.documentElement.scrollHeight - window.innerHeight) * parseFloat(s)
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true })
    else window.scrollTo(0, y)
    return Math.round(y)
  }, s)
  await page.waitForTimeout(+(process.env.SETTLE || 2600))
  const name = `${outDir}/${String(i++).padStart(2, '0')}_${s.replace(/[#:]/g, '_')}.png`
  await page.screenshot({ path: name })
  console.log('shot', name, 'y=', y)
}
if (process.env.ACTION) {
  const fn = await import(process.env.ACTION)
  await fn.default(page, outDir)
}
console.log('LOGS', JSON.stringify(logs, null, 1))
await browser.close()
