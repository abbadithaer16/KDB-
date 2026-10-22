export default async function (page) {
  await page.evaluate(() => {
    const ow = console.warn
    console.warn = (...a) => { ow(...a, new Error().stack.split('\n').slice(2, 6).join(' | ')) }
  })
  for (const f of [0.1, 0.3, 0.5, 0.7, 0.9, 1]) {
    await page.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), f)
    await page.waitForTimeout(500)
  }
}
