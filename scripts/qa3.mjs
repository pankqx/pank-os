import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('/opt/npm-tools/node_modules/playwright')
const url = process.argv[2] ?? 'http://127.0.0.1:5173/'
const b = await chromium.launch({ args: ['--no-sandbox'] })
const logs = []
async function page(vp, name) {
  const p = await b.newPage({ viewport: vp, hasTouch: vp.width < 600, isMobile: vp.width < 600 })
  p.on('console', (m) => m.type() === 'error' && logs.push(`[${name}] ${m.text()}`))
  p.on('pageerror', (e) => logs.push(`[${name}] pageerror ${e.message}`))
  return p
}
const scrollTo = async (p, id, f = 0) => {
  await p.evaluate(([i, f]) => { const el = document.getElementById(i); const h = el.offsetHeight - innerHeight; scrollTo(0, el.offsetTop + Math.max(0, h) * f) }, [id, f])
  await p.waitForTimeout(900)
}
for (const [vp, tag, who] of [[{ width: 1440, height: 900 }, 'd', 'HER'], [{ width: 390, height: 844 }, 'm', 'HIM']]) {
  const p = await page(vp, tag)
  await p.goto(url)
  await p.getByRole('button', { name: /SKIP/ }).click()
  await p.waitForTimeout(1200)
  await p.screenshot({ path: `shots/v2-${tag}-choice.png` })
  await p.getByRole('button', { name: new RegExp('^' + who) }).click()
  await p.waitForTimeout(1800)
  await scrollTo(p, 'person', 0.62); await p.screenshot({ path: `shots/v2-${tag}-fg.png` })
  await scrollTo(p, 'lab'); await p.screenshot({ path: `shots/v2-${tag}-lab.png` })
  await scrollTo(p, 'transmissions'); await p.evaluate(() => scrollBy(0, 500)); await p.waitForTimeout(800); await p.screenshot({ path: `shots/v2-${tag}-trans.png` })
  await scrollTo(p, 'trophy'); await p.evaluate(() => scrollBy(0, innerHeight * 0.9)); await p.waitForTimeout(1300); await p.screenshot({ path: `shots/v2-${tag}-trophy.png` })
  await scrollTo(p, 'meet', 1); await p.waitForTimeout(1500); await p.screenshot({ path: `shots/v2-${tag}-finale.png` })
  await p.getByPlaceholder(/Say something/).first().fill('has he won any awards?')
  await p.keyboard.press('Enter'); await p.waitForTimeout(2500); await p.screenshot({ path: `shots/v2-${tag}-finale-chat.png` })
  await scrollTo(p, 'contact'); await p.screenshot({ path: `shots/v2-${tag}-contact.png` })
  console.log(tag, 'page horizontal overflow:', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1))
  await p.close()
}
console.log(logs.join('\n') || 'no console errors')
await b.close()
