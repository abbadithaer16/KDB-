export default async function (page, out) {
  const dump = () => page.evaluate(() => {
    const r = window.__rig
    const m = document.querySelector('.campaign-media')
    return { y: Math.round(scrollY), ringT: +r.ringT.toFixed(3), ringOn: +r.ringOn.toFixed(3), clip: getComputedStyle(m).clipPath, locked: document.body.className, ov: getComputedStyle(document.documentElement).overflow }
  })
  for (const sel of ['#diamond', '#campaign']) {
    for (const f of [0.43, 0.6]) {
      await page.evaluate(([sel, f]) => { const el = document.querySelector(sel); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * f) }, [sel, f])
      await page.waitForTimeout(6000)
      console.log(sel, f, JSON.stringify(await dump()))
    }
  }
}
