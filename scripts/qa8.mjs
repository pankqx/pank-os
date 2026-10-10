import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 850 } })
const errs=[]; p.on('pageerror', e=>errs.push(e.message))
await p.goto('http://localhost:5173/#lab/peece'); await p.waitForTimeout(2500)
await p.goto('http://localhost:5173/'); await p.waitForTimeout(9500)
await p.locator('button').filter({ hasText: /roman/i }).first().click().catch(()=>{}); await p.waitForTimeout(2500)
for (const y of [9000, 14000]) { await p.evaluate(v=>scrollTo(0,v), y); await p.waitForTimeout(1500) }
await p.screenshot({ path: '/tmp/q8.png' })
console.log('rv', await p.evaluate(()=>[document.querySelectorAll('.rv').length, document.querySelectorAll('.rv.in').length]), errs)
await b.close()
