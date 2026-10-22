/** Interaction QA, run via ACTION=./interact.mjs from tests/shoot.mjs */
const wait = (p, ms) => p.waitForTimeout(ms)
const lenisTo = (page, sel, f = 0) =>
  page.evaluate(([sel, f]) => {
    const el = document.querySelector(sel)
    const top = el.getBoundingClientRect().top + window.scrollY
    const y = top + (el.offsetHeight - window.innerHeight) * f
    window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)
  }, [sel, f])

export default async function (page, out) {
  const results = []
  const ok = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`)
  const W = page.viewportSize().width
  const H = page.viewportSize().height
  const mobile = W < 760

  // ---- collections → product detail
  await lenisTo(page, '#collections', 0.0)
  await page.evaluate(() => window.scrollBy(0, 0))
  await wait(page, 1500)
  await page.locator('.card').first().scrollIntoViewIfNeeded()
  await page.locator('.card').first().click()
  await wait(page, 5000)
  ok('detail opens', await page.locator('.detail').isVisible())
  ok('stage interactive in detail', await page.locator('.stage.is-interactive').count() === 1)
  await page.screenshot({ path: `${out}/i01_detail.png` })

  await page.getByRole('button', { name: /White gold/ }).click()
  await wait(page, 2500)
  ok('metal toggles', (await page.getByRole('button', { name: /White gold/ }).getAttribute('aria-pressed')) === 'true')
  await page.screenshot({ path: `${out}/i02_white.png` })

  // drag to orbit in the 3D view area
  const vx = mobile ? W / 2 : W * 0.33
  const vy = mobile ? H * 0.26 : H / 2
  if (mobile) {
    await page.touchscreen.tap(vx, vy)
  }
  await page.mouse.move(vx, vy)
  await page.mouse.down()
  for (let i = 1; i <= 12; i++) await page.mouse.move(vx - i * 22, vy + i * 6)
  await page.mouse.up()
  await wait(page, 2500)
  await page.screenshot({ path: `${out}/i03_orbit.png` })
  await page.getByRole('button', { name: 'Reset view' }).first().click()
  await wait(page, 2500)
  await page.screenshot({ path: `${out}/i04_reset.png` })

  // gallery thumbnail
  await page.locator('.detail-gallery button').nth(3).click()
  await wait(page, 800)
  ok('gallery select', (await page.locator('.detail-gallery button').nth(3).getAttribute('aria-pressed')) === 'true')

  // next product
  await page.locator('.detail-nav button').nth(1).click()
  await wait(page, 4000)
  ok('next product', (await page.locator('.detail-panel h2').textContent()) === 'Lueur')
  await page.screenshot({ path: `${out}/i05_next.png` })

  // enquiry
  await page.locator('.detail-actions .btn').click()
  await wait(page, 1200)
  ok('enquiry opens with product', (await page.locator('#enq-piece').inputValue()) === 'lueur')
  await page.locator('form button[type=submit]').click()
  await wait(page, 400)
  ok('validation errors shown', (await page.locator('.field .err').count()) === 2)
  await page.screenshot({ path: `${out}/i06_enquiry_errors.png` })
  await page.fill('#enq-name', 'Camille Laurent')
  await page.fill('#enq-email', 'camille@example.com')
  await page.locator('form button[type=submit]').click()
  await wait(page, 800)
  ok('demo confirmation', (await page.locator('.modal-card h2').textContent()).includes('Thank you, Camille'))
  await page.screenshot({ path: `${out}/i07_enquiry_done.png` })
  await page.keyboard.press('Escape')
  await wait(page, 600)
  ok('enquiry closes on Escape', (await page.locator('.modal').count()) === 0)
  ok('detail still open under enquiry', await page.locator('.detail').isVisible())
  await page.keyboard.press('Escape')
  await wait(page, 2500)
  ok('detail closes on Escape', (await page.locator('.detail').count()) === 0)
  ok('scroll unlocked after detail', !(await page.evaluate(() => document.body.classList.contains('is-locked'))))

  // ---- bracelet inspection
  await lenisTo(page, '#bracelet', 0.3)
  await wait(page, 3500)
  await page.locator('.inspect-ui .btn').click()
  await wait(page, 3500)
  ok('inspect mode', (await page.locator('.inspect-bar').count()) === 1)
  const y0 = await page.evaluate(() => window.scrollY)
  await page.mouse.move(W / 2, H / 2)
  await page.mouse.down()
  for (let i = 1; i <= 14; i++) await page.mouse.move(W / 2 + i * 25, H / 2 - i * 4)
  await page.mouse.up()
  await page.mouse.wheel(0, -400)
  await wait(page, 2500)
  const y1 = await page.evaluate(() => window.scrollY)
  ok('page did not scroll during inspection', Math.abs(y1 - y0) < 2, `(${y0}→${y1})`)
  await page.screenshot({ path: `${out}/i08_inspect.png` })
  await page.getByRole('button', { name: 'Done' }).click()
  await wait(page, 2500)
  ok('inspect exits', (await page.locator('.inspect-bar').count()) === 0)
  await page.screenshot({ path: `${out}/i09_after_inspect.png` })

  // ---- nav anchor
  if (!mobile) {
    await page.locator('.nav-links a', { hasText: 'Craft' }).click()
  } else {
    await page.locator('.nav-burger').click()
    await wait(page, 1200)
    await page.screenshot({ path: `${out}/i10_menu.png` })
    await page.locator('.menu a', { hasText: 'Craft' }).click()
  }
  await wait(page, 3500)
  const craftTop = await page.evaluate(() => document.getElementById('craft').getBoundingClientRect().top)
  ok('nav scrolls to Craft', Math.abs(craftTop) < 40, `(top=${Math.round(craftTop)})`)

  // ---- private viewing CTA in finale
  await lenisTo(page, '#finale', 1)
  await wait(page, 2500)
  await page.locator('.finale-cta .btn').click()
  await wait(page, 1000)
  ok('finale CTA opens enquiry', (await page.locator('.modal').count()) === 1)
  await page.screenshot({ path: `${out}/i11_finale_enquiry.png` })
  await page.locator('.modal-x').click()
  await wait(page, 500)

  // ---- horizontal overflow
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ok('no horizontal overflow', overflow <= 0, `(${overflow}px)`)
  console.log('RESULTS\n' + results.join('\n'))
}
