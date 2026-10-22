import { chromium } from 'playwright-core'
const out = process.argv[2]
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await (await browser.newContext({ viewport: { width: 960, height: 570 } })).newPage()
await page.goto('http://127.0.0.1:5173/')
await page.waitForFunction(() => window.__intro, null, { timeout: 120000 })
await page.evaluate(() => { window.__intro.pause(0) })
for (const t of [0, 0.8, 1.6, 2.4, 3.4, 4.8]) {
  await page.evaluate((t) => window.__intro.pause(t), t)
  await page.waitForTimeout(7000)
  await page.screenshot({ path: `${out}/intro_${t}.png` })
}
await browser.close()
