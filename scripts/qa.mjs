import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('/opt/npm-tools/node_modules/playwright')
const url = process.argv[2] ?? 'http://127.0.0.1:5173/'
const out = process.argv[3] ?? 'shots/q'
const b = await chromium.launch({ args: ['--no-sandbox'] })
const logs = []
async function run(name, vp, fn) {
  const p = await b.newPage({ viewport: vp })
  p.on('console', (m) => ['error'].includes(m.type()) && logs.push(`[${name}] ${m.text()}`))
  p.on('pageerror', (e) => logs.push(`[${name}] pageerror: ${e.message}`))
  await p.goto(url)
  await fn(p)
  await p.close()
}
const enter = async (p, who = 'HIM') => {
  await p.getByRole('button', { name: /SKIP/ }).click()
  await p.getByRole('button', { name: new RegExp(who) }).click()
  await p.waitForTimeout(1500)
}
await run('desktop', { width: 1440, height: 900 }, async (p) => {
  await enter(p)
  await p.screenshot({ path: `${out}-d1-person.png` })
  for (const id of ['lab', 'transmissions', 'trophy', 'contact']) {
    await p.evaluate((i) => document.getElementById(i).scrollIntoView(), id)
    await p.waitForTimeout(900)
    await p.screenshot({ path: `${out}-d-${id}.png` })
  }
  await p.evaluate(() => (location.hash = 'lab/paroh-twin'))
  await p.waitForTimeout(800)
  await p.screenshot({ path: `${out}-d-dossier.png` })
  await p.keyboard.press('Escape')
  await p.waitForTimeout(400)
  console.log('hash after esc:', await p.evaluate(() => location.hash))
  await p.getByRole('button', { name: /Talk to Ash/ }).click()
  await p.waitForTimeout(600)
  await p.getByPlaceholder(/Ask Ash/).fill('tell me about eventzee')
  await p.keyboard.press('Enter')
  await p.waitForTimeout(1800)
  await p.screenshot({ path: `${out}-d-companion.png` })
})
await run('mobile', { width: 390, height: 844 }, async (p) => {
  await enter(p, 'HER')
  await p.screenshot({ path: `${out}-m1.png` })
  await p.evaluate(() => document.getElementById('lab').scrollIntoView())
  await p.waitForTimeout(700)
  await p.screenshot({ path: `${out}-m-lab.png` })
  const sw = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  console.log('mobile horizontal page scroll:', sw)
})
await run('deeplink', { width: 1200, height: 800 }, async (p) => {
  await p.goto(url + '#lab/peece')
  await p.waitForTimeout(1200)
  await p.screenshot({ path: `${out}-deeplink.png` })
})
await run('reduced', { width: 1200, height: 800 }, async () => {})
console.log(logs.join('\n') || 'no console errors')
await b.close()
