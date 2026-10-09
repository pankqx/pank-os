import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('/opt/npm-tools/node_modules/playwright')
const url = 'http://127.0.0.1:5173/'
const b = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] })
const logs = []
for (const [vp, tag] of [[{ width: 1440, height: 900 }, 'd'], [{ width: 390, height: 844 }, 'm']]) {
  const p = await b.newPage({ viewport: vp, hasTouch: vp.width < 600, isMobile: vp.width < 600 })
  p.on('console', (m) => m.type() === 'error' && logs.push(`[${tag}] ${m.text()}`))
  p.on('pageerror', (e) => logs.push(`[${tag}] pageerror ${e.message}`))
  await p.addInitScript(() => localStorage.setItem('pankos.fx', 'full'))
  await p.goto(url)
  await p.getByRole('button', { name: /SKIP/ }).click(); await p.waitForTimeout(1200)
  await p.screenshot({ path: `shots/v3-${tag}-choice.png` })
  await p.getByRole('button', { name: /^HER/ }).click(); await p.waitForTimeout(1800)
  const sec = async (id, f = 0, extra = 0, name = id) => {
    await p.evaluate(([i, f, e]) => { const el = document.getElementById(i); window.scrollTo({ top: el.offsetTop + Math.max(0, el.offsetHeight - innerHeight) * f + e, behavior: 'instant' }) }, [id, f, extra])
    await p.waitForTimeout(1100); await p.screenshot({ path: `shots/v3-${tag}-${name}.png` })
  }
  await sec('person', 0.05, 0, 'story1'); await sec('person', 0.45, 0, 'story3'); await sec('person', 0.75, 0, 'story5')
  await sec('person-notes', 0, 0, 'notes'); await sec('person-notes', 0, 1100, 'makes'); await sec('person-notes', 0, 2000, 'hobbies')
  await sec('algopath', 0, 0, 'algo'); await p.waitForTimeout(3500); await p.screenshot({ path: `shots/v3-${tag}-algo2.png` })
  await sec('lab', 0, 450, 'lab')
  await p.locator('.artifact').nth(1).click({ position: { x: 300, y: 40 } }); await p.waitForTimeout(900); await p.screenshot({ path: `shots/v3-${tag}-dossier.png` })
  await p.evaluate(() => { location.hash = 'lab/peece' }); await p.waitForTimeout(900); await p.evaluate(() => document.querySelector('.dos-gallery')?.scrollIntoView()); await p.waitForTimeout(800); await p.screenshot({ path: `shots/v3-${tag}-gallery.png` })
  await p.keyboard.press('Escape'); await p.waitForTimeout(500)
  await sec('transmissions', 0, 400, 'trans')
  await p.evaluate(() => { location.hash = 'post/naac-thirteen-months' }); await p.waitForTimeout(1200); await p.screenshot({ path: `shots/v3-${tag}-post.png` })
  await p.keyboard.press('Escape'); await p.waitForTimeout(500)
  await sec('trophy', 0, 0, 'trophy')
  await sec('meet', 1, 0, 'finale')
  await sec('contact', 0, 0, 'contact')
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400)
  if (tag === 'd') {
    await p.getByRole('button', { name: /Talk to Reenu/ }).click({ force: true }); await p.waitForTimeout(2200); await p.screenshot({ path: `shots/v3-${tag}-overlay.png` })
    for (let i = 0; i < 12; i++) { await p.mouse.move(200 + i * 60, 300 + (i % 2) * 120); await p.waitForTimeout(16) }
    await p.screenshot({ path: `shots/v3-${tag}-cursor.png` })
  }
  console.log(tag, 'overflow:', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1))
  await p.close()
}
console.log(logs.join('\n') || 'no console errors')
await b.close()
