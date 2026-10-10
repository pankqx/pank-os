import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs'
const b = await chromium.launch()
for (const [w,h] of [[1900,1000],[1440,850],[390,844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(9800)
  await p.locator('button').filter({ hasText: /reenu/i }).first().click().catch(()=>{}); await p.waitForTimeout(3000)
  await p.evaluate(()=>document.getElementById('lab').scrollIntoView()); await p.waitForTimeout(800); await p.evaluate(()=>window.scrollBy(0,380)); await p.waitForTimeout(1200)
  console.log(w, await p.evaluate(()=>{const r=document.querySelector('.orb').getBoundingClientRect(); const k=document.querySelector('.orb .rock').getBoundingClientRect(); return [Math.round(r.width),Math.round(r.height),Math.round(k.width),Math.round(k.height)]}))
  await p.screenshot({path:`/tmp/o_${w}.png`}); await p.close()
}
await b.close()
