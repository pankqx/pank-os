// Dev QA helper: node scripts/shoot.mjs <url> <outPrefix>
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? '/opt/npm-tools/node_modules/playwright')
const url = process.argv[2] ?? 'http://localhost:5173/'
const out = process.argv[3] ?? 'shots/s'
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--no-sandbox'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const logs = []
p.on('console', (m) => ['error', 'warning'].includes(m.type()) && logs.push(m.type() + ': ' + m.text()))
p.on('pageerror', (e) => logs.push('pageerror: ' + e.message))
await p.goto(url)
for (const [i, ms] of [800, 1600, 1800, 1000, 1200, 1500].entries()) {
  await p.waitForTimeout(ms)
  await p.screenshot({ path: `${out}-open${i}.png` })
}
await p.waitForTimeout(1500)
await p.screenshot({ path: `${out}-choice.png` })
console.log(logs.join('\n') || 'no console errors')
await b.close()
