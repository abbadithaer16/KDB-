/** Rapid scroll stress: random jumps both directions, then deterministic state checks. */
const go = (page, sel, f, immediate = true) =>
  page.evaluate(([sel, f, immediate]) => {
    let y
    if (sel === 'abs') y = (document.documentElement.scrollHeight - innerHeight) * f
    else {
      const el = document.querySelector(sel)
      y = el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * f
    }
    window.__lenis.scrollTo(y, { immediate, force: true, duration: 0.6 })
  }, [sel, f, immediate])

export default async function (page, out) {
  const res = []
  const ok = (n, c, x = '') => res.push(`${c ? 'PASS' : 'FAIL'}  ${n} ${x}`)
  // 40 random jumps, 60ms apart
  let seed = 3
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 40; i++) {
    await go(page, 'abs', rnd(), i % 3 !== 0)
    await page.waitForTimeout(60)
  }
  // fast animated sweeps down and up
  await go(page, 'abs', 1, false); await page.waitForTimeout(300)
  await go(page, 'abs', 0, false); await page.waitForTimeout(300)
  await go(page, 'abs', 0.6, false); await page.waitForTimeout(250)

  const state = () => page.evaluate(() => { const r = window.__rig; return { ringT: r.ringT, ringOn: r.ringOn, neckT: r.neckT, neckOn: r.neckOn, braceT: r.braceT, braceOn: r.braceOn, visible: window.__ui.get().stageVisible } })
  const capsOn = (scope) =>
    page.evaluate((scope) => [...document.querySelectorAll(`${scope} .cap-in`)].map((c) => +getComputedStyle(c).opacity > 0.5), scope)

  await go(page, 'abs', 0); await page.waitForTimeout(3000)
  let s = await state()
  ok('top: ring lit, others dark', s.ringOn === 1 && s.neckOn === 0 && s.braceOn === 0, JSON.stringify(s))
  ok('top: ringT = 0', Math.abs(s.ringT) < 1e-3, `(${s.ringT})`)
  ok('top: no diamond captions', (await capsOn('#diamond')).every((v) => !v))
  await page.screenshot({ path: `${out}/s_top.png` })

  await go(page, '#diamond', 0.43); await page.waitForTimeout(3000)
  ok('diamond 0.43: only caption II', JSON.stringify(await capsOn('#diamond')) === '[false,true,false,false]', JSON.stringify(await capsOn('#diamond')))
  s = await state()
  ok('diamond 0.43: ringT', Math.abs(s.ringT - (0.12 + 0.88 * 0.43)) < 0.01, `(${s.ringT.toFixed(3)})`)

  await go(page, '#craft', 0.5); await page.waitForTimeout(2000)
  s = await state()
  ok('craft: stage paused', s.visible === false && s.neckOn === 0, JSON.stringify(s))

  await go(page, '#bracelet', 0.5); await page.waitForTimeout(3000)
  s = await state()
  ok('bracelet 0.5: lit', s.braceOn === 1 && Math.abs(s.braceT - 0.5) < 0.01 && s.ringOn === 0, JSON.stringify(s))
  await page.screenshot({ path: `${out}/s_bracelet.png` })

  await go(page, '#necklace', 0.3); await page.waitForTimeout(3000)
  s = await state()
  ok('back to necklace 0.3', s.neckOn === 1 && s.braceOn === 0 && Math.abs(s.neckT - 0.3) < 0.01, JSON.stringify(s))
  await page.screenshot({ path: `${out}/s_necklace.png` })

  await go(page, '#diamond', 0.68); await page.waitForTimeout(3000)
  ok('back to diamond 0.68: only caption III', JSON.stringify(await capsOn('#diamond')) === '[false,false,true,false]')
  await page.screenshot({ path: `${out}/s_diamond.png` })
  console.log('RESULTS\n' + res.join('\n'))
}
