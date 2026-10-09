import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('/opt/npm-tools/node_modules/playwright')
const b = await chromium.launch({ args: ['--no-sandbox'] })
const logs = []
const mk = async (opts) => { const c = await b.newContext(opts); const p = await c.newPage(); p.on('console', (m) => m.type() === 'error' && logs.push(m.text())); p.on('pageerror', (e) => logs.push('pageerror ' + e.message)); return p }
// reduced motion
let p = await mk({ viewport: { width: 1200, height: 800 }, reducedMotion: 'reduce' })
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(700)
await p.screenshot({ path: 'shots/r-open.png' })
await p.waitForTimeout(1800)
console.log('reduced: reached choice =', await p.getByText('Who would you like to meet?').isVisible())
// keyboard: choose with keyboard
p = await mk({ viewport: { width: 1200, height: 800 } })
await p.goto('http://127.0.0.1:5173/'); await p.keyboard.press('Enter'); await p.waitForTimeout(900)
await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(1600)
console.log('keyboard chose rhea:', await p.getByRole('button', { name: /talk to Rhea/i }).isVisible())
await p.keyboard.press('3'); await p.waitForTimeout(1200)
console.log('hash after key 3:', await p.evaluate(() => location.hash))
await p.screenshot({ path: 'shots/k-trans.png' })
await p.keyboard.press('5'); await p.waitForTimeout(1200)
await p.screenshot({ path: 'shots/k-contact.png' })
// strip arrow keys
await p.keyboard.press('2'); await p.waitForTimeout(900)
await p.locator('.strip').focus(); const x0 = await p.evaluate(() => document.querySelector('.strip').scrollLeft)
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(900)
console.log('strip scrolled:', (await p.evaluate(() => document.querySelector('.strip').scrollLeft)) > x0)
// newsletter honesty
await p.evaluate(() => document.getElementById('transmissions').scrollIntoView()); await p.fill('#nl', 'a@b.co'); await p.getByRole('button', { name: 'try it' }).click()
console.log('newsletter:', await p.locator('.news p').innerText())
// mobile opening/choice
p = await mk({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(4200); await p.screenshot({ path: 'shots/m-open.png' }); await p.keyboard.press('Enter'); await p.waitForTimeout(1500)
await p.screenshot({ path: 'shots/m-choice.png' })
console.log(logs.join('\n') || 'no console errors')
await b.close()
