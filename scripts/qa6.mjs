import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('/opt/npm-tools/node_modules/playwright')
const b = await chromium.launch({ args: ['--no-sandbox'] })
const logs = []
for (const [vp, tag] of [[{ width: 1440, height: 900 }, 'd'], [{ width: 390, height: 844 }, 'm']]) {
  const p = await b.newPage({ viewport: vp, isMobile: vp.width < 600, hasTouch: vp.width < 600 })
  p.on('console', (m) => m.type() === 'error' && logs.push(`[${tag}] ${m.text()}`))
  p.on('pageerror', (e) => logs.push(`[${tag}] ${e.message}`))
  await p.addInitScript(() => { localStorage.setItem('pankos.fx', 'full'); sessionStorage.setItem('pankos.gf', '1') })
  await p.goto('http://127.0.0.1:5173/#person'); await p.waitForTimeout(2600)
  const el = await p.evaluate(() => { const e = document.getElementById('person'); return [e.offsetTop, e.offsetHeight] })
  for (const [i, f] of [0, 0.17, 0.34, 0.5, 0.67, 0.84, 1].entries()) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), el[0] + (el[1] - vp.height) * f)
    await p.waitForTimeout(700); await p.screenshot({ path: `shots/ol-${tag}-${i}.png` })
  }
  await p.close()
}
console.log(logs.join('\n') || 'no console errors')
await b.close()
