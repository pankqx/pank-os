import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('/opt/npm-tools/node_modules/playwright')
const b = await chromium.launch({ args: ['--no-sandbox'] })
const logs = []
for (const [vp, tag] of [[{ width: 1440, height: 900 }, 'd'], [{ width: 390, height: 844 }, 'm']]) {
  const p = await b.newPage({ viewport: vp, isMobile: vp.width < 600, hasTouch: vp.width < 600 })
  p.on('console', (m) => m.type() === 'error' && logs.push(`[${tag}] ${m.text()}`))
  p.on('pageerror', (e) => logs.push(`[${tag}] ${e.message}`))
  await p.addInitScript(() => { localStorage.setItem('pankos.fx', 'full'); localStorage.setItem('pankos.character', 'reenu') })
  await p.goto('http://127.0.0.1:5173/#person'); await p.waitForTimeout(1800)
  const go = async (id, f, extra, name) => {
    await p.evaluate(([i, f, e]) => { const el = document.getElementById(i); window.scrollTo({ top: el.offsetTop + Math.max(0, el.offsetHeight - innerHeight) * f + e, behavior: 'instant' }) }, [id, f, extra])
    await p.waitForTimeout(900); await p.screenshot({ path: `shots/v4-${tag}-${name}.png` })
  }
  for (const [f, n] of [[0.03, 's1'], [0.24, 's2'], [0.42, 's3'], [0.58, 's4'], [0.75, 's5'], [0.95, 's6']]) await go('person', f, 0, n)
  await go('person-notes', 0, 600, 'notes'); await go('prontopy', 0, -300, 'gap'); await go('transmissions', 0, 300, 'trans'); await go('contact', 0, 0, 'contact')
  if (tag === 'd') {
    await go('lab', 0, 400, 'lab')
    const s = await p.$('.strip'); const bb = await s.boundingBox()
    await p.mouse.move(bb.x + 800, bb.y + 200); await p.mouse.down(); for (let i = 0; i < 12; i++) { await p.mouse.move(bb.x + 800 - i * 40, bb.y + 200); await p.waitForTimeout(16) } await p.mouse.up()
    await p.waitForTimeout(1200); console.log('scrollLeft after drag', await p.evaluate(() => document.querySelector('.strip').scrollLeft))
    await p.screenshot({ path: `shots/v4-d-lab2.png` })
    await p.evaluate(() => { location.hash = 'post/the-community-that-didnt-make-it' }); await p.waitForTimeout(1000); await p.screenshot({ path: `shots/v4-d-post.png` })
  }
  await p.close()
}
console.log(logs.join('\n') || 'no console errors')
await b.close()
