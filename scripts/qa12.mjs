import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs'
const b = await chromium.launch()
async function run(w,h,tag){
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs=[]; p.on('pageerror', e=>errs.push(e.message))
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(9800)
  await p.locator('button').filter({ hasText: /roman/i }).first().click().catch(()=>{}); await p.waitForTimeout(3500)
  await p.screenshot({path:`/tmp/${tag}_a0.png`})
  const pr = await p.evaluate(()=>{const e=document.getElementById('person-notes'); return e.offsetTop})
  await p.evaluate(t=>scrollTo(0,t),pr); await p.waitForTimeout(1500); await p.screenshot({path:`/tmp/${tag}_paper.png`})
  await p.evaluate(t=>scrollTo(0,t+700),pr); await p.waitForTimeout(1200); await p.screenshot({path:`/tmp/${tag}_paper2.png`})
  await p.evaluate(()=>document.getElementById('lab').scrollIntoView()); await p.waitForTimeout(800); await p.evaluate(()=>window.scrollBy(0,380)); await p.waitForTimeout(1200)
  await p.screenshot({path:`/tmp/${tag}_lab.png`})
  const x0 = await p.evaluate(()=>document.querySelector('.strip').scrollLeft); await p.locator('.orb').click({force:true}); await p.waitForTimeout(1500)
  console.log(tag, 'strip', x0, '->', await p.evaluate(()=>document.querySelector('.strip').scrollLeft), 'overflowX', await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth), errs); await p.close()
}
await run(1440,850,'d'); await run(390,844,'m'); await b.close()
