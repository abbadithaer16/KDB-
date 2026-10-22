export default async function (page) {
  await page.locator('.nav-burger').click()
  for (const t of [300, 1000, 2500]) {
    await page.waitForTimeout(t)
    console.log(t, await page.evaluate(() => getComputedStyle(document.querySelector('.menu')).clipPath + ' | ' + document.querySelector('.menu').className))
  }
}
